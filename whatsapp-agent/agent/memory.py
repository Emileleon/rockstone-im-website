# agent/memory.py — Mémoire des conversations, qualification et relances
# Généré par AgentKit

"""
Système de mémoire de l'agent (SQLite en local, PostgreSQL en production) :
  - Mensaje       : historique des conversations par numéro de téléphone
  - Lead          : données qualifiées du prospect (nom, projet, budget…)
  - Seguimiento   : planification des relances proactives
"""

import os
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Text, DateTime, Boolean, select, Integer
from dotenv import load_dotenv

load_dotenv()

# Configuration de la base de données
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agentkit.db")

# En production avec PostgreSQL, ajuster le schéma de l'URL
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Mensaje(Base):
    """Modèle de message dans la base de données."""
    __tablename__ = "mensajes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefono: Mapped[str] = mapped_column(String(50), index=True)
    role: Mapped[str] = mapped_column(String(20))  # "user" ou "assistant"
    content: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Lead(Base):
    """Données qualifiées d'un prospect, remplies au fil de la conversation."""
    __tablename__ = "leads"

    telefono: Mapped[str] = mapped_column(String(50), primary_key=True)
    nombre: Mapped[str] = mapped_column(String(200), default="")
    tipo: Mapped[str] = mapped_column(String(30), default="")        # "gestion" | "transaction"
    operacion: Mapped[str] = mapped_column(String(60), default="")   # achat / vente / location / mandat…
    bien: Mapped[str] = mapped_column(Text, default="")              # nature + localisation du bien
    presupuesto: Mapped[str] = mapped_column(String(120), default="")  # budget ou loyer
    sector: Mapped[str] = mapped_column(String(200), default="")     # secteur recherché
    plazo: Mapped[str] = mapped_column(String(120), default="")      # délai / échéance
    objeto: Mapped[str] = mapped_column(Text, default="")            # objet détaillé de la demande
    completo: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Seguimiento(Base):
    """Planification des relances proactives d'un prospect silencieux."""
    __tablename__ = "seguimientos"

    telefono: Mapped[str] = mapped_column(String(50), primary_key=True)
    etapa: Mapped[int] = mapped_column(Integer, default=0)           # nb de relances déjà envoyées
    proxima_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# Champs qualifiables du lead (utilisés pour l'upsert et le calcul de complétude)
CAMPOS_LEAD = ("nombre", "tipo", "operacion", "bien", "presupuesto", "sector", "plazo", "objeto")


async def inicializar_db():
    """Crée les tables si elles n'existent pas."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ── Conversations ────────────────────────────────────────────

async def guardar_mensaje(telefono: str, role: str, content: str):
    """Enregistre un message dans l'historique de conversation."""
    async with async_session() as session:
        session.add(Mensaje(telefono=telefono, role=role, content=content,
                            timestamp=datetime.utcnow()))
        await session.commit()


async def obtener_historial(telefono: str, limite: int = 20) -> list[dict]:
    """Récupère les N derniers messages d'une conversation (ordre chronologique)."""
    async with async_session() as session:
        query = (
            select(Mensaje)
            .where(Mensaje.telefono == telefono)
            .order_by(Mensaje.timestamp.desc())
            .limit(limite)
        )
        result = await session.execute(query)
        mensajes = result.scalars().all()
        mensajes.reverse()
        return [{"role": m.role, "content": m.content} for m in mensajes]


async def limpiar_historial(telefono: str):
    """Efface tout l'historique d'une conversation."""
    async with async_session() as session:
        result = await session.execute(select(Mensaje).where(Mensaje.telefono == telefono))
        for m in result.scalars().all():
            await session.delete(m)
        await session.commit()


# ── Qualification (Lead) ─────────────────────────────────────

def _calcular_completo(lead: "Lead") -> bool:
    """Un lead est considéré complet quand l'essentiel est connu."""
    base = bool(lead.nombre) and bool(lead.tipo) and bool(lead.objeto)
    if lead.tipo == "transaction":
        return base and bool(lead.operacion)
    return base


async def upsert_lead(telefono: str, **campos) -> dict:
    """
    Crée ou met à jour les champs qualifiés d'un prospect.
    Seuls les champs non vides fournis sont écrits. Retourne l'état du lead.
    """
    async with async_session() as session:
        lead = await session.get(Lead, telefono)
        if lead is None:
            lead = Lead(telefono=telefono)
            session.add(lead)
        for campo in CAMPOS_LEAD:
            valor = campos.get(campo)
            if valor:  # on n'écrase jamais avec une valeur vide
                setattr(lead, campo, str(valor))
        lead.completo = _calcular_completo(lead)
        lead.updated_at = datetime.utcnow()
        await session.commit()
        return {c: getattr(lead, c) for c in CAMPOS_LEAD} | {"completo": lead.completo}


async def obtener_lead(telefono: str) -> dict | None:
    """Retourne les données qualifiées d'un prospect, ou None."""
    async with async_session() as session:
        lead = await session.get(Lead, telefono)
        if lead is None:
            return None
        return {c: getattr(lead, c) for c in CAMPOS_LEAD} | {"completo": lead.completo}


# ── Relances (Seguimiento) ───────────────────────────────────

async def programar_seguimiento(telefono: str, proxima_at: datetime, etapa: int | None = None):
    """Planifie (ou replanifie) la prochaine relance d'un prospect."""
    async with async_session() as session:
        seg = await session.get(Seguimiento, telefono)
        if seg is None:
            seg = Seguimiento(telefono=telefono)
            session.add(seg)
        if etapa is not None:
            seg.etapa = etapa
        seg.proxima_at = proxima_at
        seg.activo = True
        seg.updated_at = datetime.utcnow()
        await session.commit()


async def avanzar_seguimiento(telefono: str, etapa: int, proxima_at: datetime | None, activo: bool):
    """Met à jour l'état d'une relance après envoi (étape suivante ou désactivation)."""
    async with async_session() as session:
        seg = await session.get(Seguimiento, telefono)
        if seg is None:
            return
        seg.etapa = etapa
        seg.proxima_at = proxima_at
        seg.activo = activo
        seg.updated_at = datetime.utcnow()
        await session.commit()


async def cancelar_seguimiento(telefono: str):
    """Désactive les relances d'un prospect (ex : il a répondu ou est qualifié)."""
    async with async_session() as session:
        seg = await session.get(Seguimiento, telefono)
        if seg is not None:
            seg.activo = False
            seg.proxima_at = None
            seg.updated_at = datetime.utcnow()
            await session.commit()


async def obtener_relances_pendientes(ahora: datetime) -> list[dict]:
    """Retourne les relances actives dont l'échéance est atteinte."""
    async with async_session() as session:
        query = select(Seguimiento).where(
            Seguimiento.activo.is_(True),
            Seguimiento.proxima_at.is_not(None),
            Seguimiento.proxima_at <= ahora,
        )
        result = await session.execute(query)
        return [{"telefono": s.telefono, "etapa": s.etapa} for s in result.scalars().all()]

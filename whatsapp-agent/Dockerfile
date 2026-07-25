FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
# Forme shell pour que ${PORT} (fourni par Railway) soit interprété ; 8000 en local.
CMD uvicorn agent.main:app --host 0.0.0.0 --port ${PORT:-8000}

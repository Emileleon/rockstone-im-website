---
name: scrapegraph-ai
description: "LLM-powered web scraping with ScrapeGraphAI. Extracts structured data from any website or local document using a natural-language prompt instead of hand-written CSS/XPath selectors. Use when the task is to scrape, crawl, extract, or harvest data from web pages — property listings, company info, prices, contacts, tables, articles — into structured JSON. Wraps ScrapeGraphAI's SmartScraperGraph (single page) and SearchGraph (top-N search results). Supports OpenAI, Anthropic/Claude, and local Ollama models. Triggers: 'scrape this site', 'extract data from URL', 'get listings from', 'web scraping', 'crawl page into JSON'."
---

# ScrapeGraphAI — LLM Web Scraping

[ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai) builds scraping
pipelines from a **prompt + a source URL** using an LLM plus graph logic, so you
describe *what* to extract in natural language instead of writing brittle
selectors. This skill packages the library plus a ready-to-run CLI helper.

## When to Apply

Use this skill when the task involves pulling structured information out of the
open web or local HTML/PDF/text documents — for example gathering real-estate
listings, company details, pricing, contact info, or tabular data into JSON.

Do **not** use it for calling a site's official JSON API (fetch it directly) or
for scraping content behind a login the user hasn't authorized.

## Install (one-time)

ScrapeGraphAI is a Python package. From a Python 3.10+ environment:

```bash
pip install -r .claude/skills/scrapegraph-ai/requirements.txt
playwright install chromium
```

`playwright install` is required — the library uses a headless browser to fetch
pages. In this container Chromium is already present at `/opt/pw-browsers`
(`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`), so `playwright install` may be skipped.

## Configure the model

Set the API key for whichever provider you use, then pick a model:

| Provider  | Env var             | Example `--model`                 |
|-----------|---------------------|-----------------------------------|
| OpenAI    | `OPENAI_API_KEY`    | `openai/gpt-4o-mini`              |
| Anthropic | `ANTHROPIC_API_KEY` | `anthropic/claude-sonnet-5`       |
| Ollama    | (none, local)       | `ollama/llama3.2`                 |

For Anthropic, use a current Claude model id — check the `claude-api` skill for
the latest ids before hard-coding one.

## Usage — CLI helper

The helper `scripts/scrape.py` wraps the two most useful graphs and prints JSON
to stdout.

Single page (SmartScraperGraph):

```bash
python .claude/skills/scrapegraph-ai/scripts/scrape.py \
  --prompt "Extract each property listing: title, price, address, bedrooms, url" \
  --source "https://example-agency.com/for-sale" \
  --model "openai/gpt-4o-mini"
```

Local document (pass a file path or raw HTML as `--source`):

```bash
python .claude/skills/scrapegraph-ai/scripts/scrape.py \
  --prompt "List all tenants and their lease end dates" \
  --source ./exports/rent-roll.html \
  --model "anthropic/claude-sonnet-5"
```

Search the web and extract from the top results (SearchGraph):

```bash
python .claude/skills/scrapegraph-ai/scripts/scrape.py --graph search \
  --prompt "Average 2-bedroom rent in Geneva city centre, with sources" \
  --max-results 5 \
  --model "openai/gpt-4o-mini"
```

Write the result to a file with `--out result.json`. Add `--verbose` to see the
pipeline steps, `--no-headless` to watch the browser.

## Library API (for writing custom pipelines)

```python
from scrapegraphai.graphs import SmartScraperGraph

graph_config = {
    "llm": {
        "api_key": "YOUR_OPENAI_API_KEY",
        "model": "openai/gpt-4o-mini",
    },
    "verbose": True,
    "headless": True,
}

graph = SmartScraperGraph(
    prompt="Extract the company description, founders and social links",
    source="https://scrapegraphai.com/",
    config=graph_config,
)
result = graph.run()   # -> dict
```

Available graph classes: `SmartScraperGraph`, `SearchGraph`, `SpeechGraph`,
`ScriptCreatorGraph`, `SmartScraperMultiGraph`, `ScriptCreatorMultiGraph`.

## Notes & etiquette

- Respect each site's `robots.txt` and Terms of Service; scrape only what the
  user is authorized to access. Keep `--max-results` modest to avoid hammering
  servers.
- LLM extraction is best-effort — spot-check results before relying on them.
- Costs scale with page size and model; prefer a small/cheap model for large
  crawls and reserve a stronger model for messy pages.

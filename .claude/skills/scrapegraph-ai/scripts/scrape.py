#!/usr/bin/env python3
"""CLI wrapper around ScrapeGraphAI for the scrapegraph-ai skill.

Runs a SmartScraperGraph (single page / local document) or a SearchGraph
(top-N web search results) from a natural-language prompt and prints the
extracted data as JSON.

Examples
--------
    scrape.py --prompt "..." --source https://site.com --model openai/gpt-4o-mini
    scrape.py --graph search --prompt "..." --max-results 5 --out result.json
"""

import argparse
import json
import os
import sys


# model prefix -> env var that must hold the API key (ollama needs none)
PROVIDER_KEYS = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "azure": "AZURE_OPENAI_API_KEY",
    "groq": "GROQ_API_KEY",
    "google": "GOOGLE_API_KEY",
    "gemini": "GOOGLE_API_KEY",
}


def build_config(model: str, verbose: bool, headless: bool, max_results: int) -> dict:
    """Build the graph_config dict ScrapeGraphAI expects."""
    provider = model.split("/", 1)[0].lower()
    llm: dict = {"model": model}

    key_var = PROVIDER_KEYS.get(provider)
    if key_var:
        api_key = os.environ.get(key_var)
        if not api_key:
            sys.exit(
                f"error: model '{model}' needs {key_var} set in the environment."
            )
        llm["api_key"] = api_key

    config = {"llm": llm, "verbose": verbose, "headless": headless}
    if max_results:
        config["max_results"] = max_results
    return config


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--prompt", required=True, help="What to extract, in plain language.")
    parser.add_argument(
        "--source",
        help="URL, local file path, or raw HTML. Required for --graph smart (default).",
    )
    parser.add_argument(
        "--graph",
        choices=["smart", "search"],
        default="smart",
        help="smart = single page/document (default); search = top-N web results.",
    )
    parser.add_argument(
        "--model",
        default="openai/gpt-4o-mini",
        help="provider/model, e.g. openai/gpt-4o-mini, anthropic/claude-sonnet-5, ollama/llama3.2.",
    )
    parser.add_argument("--max-results", type=int, default=5, help="SearchGraph: number of results.")
    parser.add_argument("--out", help="Write JSON here instead of stdout.")
    parser.add_argument("--verbose", action="store_true", help="Print pipeline steps.")
    parser.add_argument("--no-headless", dest="headless", action="store_false", help="Show the browser.")
    parser.set_defaults(headless=True)
    args = parser.parse_args()

    try:
        from scrapegraphai.graphs import SmartScraperGraph, SearchGraph
    except ImportError:
        sys.exit(
            "error: scrapegraphai is not installed. Run:\n"
            "  pip install -r .claude/skills/scrapegraph-ai/requirements.txt"
        )

    config = build_config(args.model, args.verbose, args.headless, args.max_results)

    if args.graph == "search":
        graph = SearchGraph(prompt=args.prompt, config=config)
    else:
        if not args.source:
            sys.exit("error: --source is required for --graph smart.")
        graph = SmartScraperGraph(prompt=args.prompt, source=args.source, config=config)

    result = graph.run()
    payload = json.dumps(result, indent=2, ensure_ascii=False, default=str)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(payload)
        print(f"wrote {args.out}")
    else:
        print(payload)


if __name__ == "__main__":
    main()

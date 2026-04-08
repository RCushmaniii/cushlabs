"""Audit the live cushlabs.ai prod deploy after the positioning rewrite PRs."""
from playwright.sync_api import sync_playwright
import json
import sys

PAGES = [
    ("EN home",      "https://cushlabs.ai/"),
    ("ES home",      "https://cushlabs.ai/es/"),
    ("EN services",  "https://cushlabs.ai/services/"),
    ("ES services",  "https://cushlabs.ai/es/services/"),
    ("EN portfolio", "https://cushlabs.ai/portfolio/"),
    ("ES portfolio", "https://cushlabs.ai/es/portfolio/"),
]

# Strings we expect to find on each page (proves the new copy is live)
EXPECTED = {
    "EN home": [
        "AI Chatbots & Automation for Small Business",
        "I Build AI Chatbots, Voice Agents",
        "Live in 2",  # 2-6 weeks
        "Workflow Automation",
        "Does This Sound Like Your Business",
        "Why Work With Me",
        "Let's Talk About Automating",
    ],
    "ES home": [
        "Chatbots de IA y Automatización para Pequeñas Empresas",
        "Construyo Chatbots de IA",
        "En vivo en 2",
        "Automatización de Procesos",
        "Por Qué Trabajar Conmigo",
        "Hablemos Sobre Automatizar",
    ],
    "EN services": [
        "What I Build — And What It Costs",
        "AI Customer Support Chatbot",
        "Google Maps Competitor Tracking",
        "Custom Workflow Automation",
        "AI Strategy Session",
    ],
    "ES services": [
        "Lo Que Construyo",
        "Chatbot de Atención al Cliente",
        "Monitoreo de Competidores en Google Maps",
        "Automatización de Procesos a la Medida",
        "Sesión de Estrategia",
    ],
    "EN portfolio": [
        "Real AI Projects — Built for Real Businesses",
        "Want Something Like This",
    ],
    "ES portfolio": [
        "Proyectos Reales de IA",
        "¿Quieres Algo Como Esto",
    ],
}

results = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1400, "height": 900})

    for label, url in PAGES:
        page = context.new_page()
        console_errors = []
        page.on("pageerror", lambda exc: console_errors.append(f"PAGEERROR: {exc}"))
        page.on("console", lambda msg: console_errors.append(f"CONSOLE.{msg.type}: {msg.text}") if msg.type == "error" else None)

        try:
            response = page.goto(url, wait_until="networkidle", timeout=30000)
            status = response.status if response else "no response"
        except Exception as e:
            results.append({"page": label, "url": url, "status": f"FAILED: {e}"})
            page.close()
            continue

        title = page.title()
        body_text = page.locator("body").inner_text()

        # Check expected strings
        missing = [s for s in EXPECTED.get(label, []) if s not in body_text]

        # For portfolio pages, check the visible card count (default filter behavior)
        visible_cards = None
        if "portfolio" in label:
            try:
                # Wait briefly for the JS filter to apply
                page.wait_for_timeout(500)
                cards = page.locator(".project-card:visible").count()
                visible_cards = cards
            except Exception:
                pass

        # Screenshot
        slug = label.replace(" ", "_")
        page.screenshot(path=f"/tmp/audit_{slug}.png", full_page=False)

        results.append({
            "page": label,
            "url": url,
            "status": status,
            "title": title,
            "missing_strings": missing,
            "visible_cards": visible_cards,
            "console_errors": console_errors[:5],  # cap noise
        })
        page.close()

    browser.close()

# Print as JSON for clean parsing
print(json.dumps(results, indent=2, ensure_ascii=False))

# Exit non-zero if any page failed or had missing strings
hard_fail = any(
    isinstance(r.get("status"), str) and "FAILED" in r["status"]
    or r.get("missing_strings")
    or (r.get("status") and r["status"] != 200 and r["status"] != "no response")
    for r in results
)
sys.exit(1 if hard_fail else 0)

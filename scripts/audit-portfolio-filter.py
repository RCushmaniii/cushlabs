"""Verify the portfolio default-Featured filter is actually applied."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1400, "height": 1200})
    page.goto("https://cushlabs.ai/portfolio/", wait_until="networkidle")
    page.wait_for_timeout(1500)  # Give the JS filter time to run

    # Check which filter button has the active state
    active_btn = page.locator(".filter-btn.active").first.get_attribute("data-filter")
    print(f"Active filter (DOM): {active_btn}")

    # Check display:none vs visible cards via computed style
    cards = page.locator(".project-card").all()
    print(f"Total .project-card in DOM: {len(cards)}")

    visible_count = 0
    hidden_count = 0
    visible_names = []
    for card in cards:
        display = card.evaluate("el => getComputedStyle(el).display")
        if display == "none":
            hidden_count += 1
        else:
            visible_count += 1
            # Try to get the project title from the card
            try:
                title = card.locator("h3, h2").first.inner_text()
                visible_names.append(title.strip()[:50])
            except Exception:
                pass

    print(f"Visible cards (display != none): {visible_count}")
    print(f"Hidden cards: {hidden_count}")
    print(f"Visible project names:")
    for n in visible_names:
        print(f"  - {n}")

    page.screenshot(path="/tmp/portfolio_default.png", full_page=True)
    browser.close()

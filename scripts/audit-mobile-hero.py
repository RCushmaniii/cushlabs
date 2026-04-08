"""Capture mobile (375x812 iPhone) screenshot of homepage hero to verify the
4-item stat bar wraps cleanly."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 375, "height": 812},
        device_scale_factor=2,
        is_mobile=True,
    )
    page = context.new_page()
    page.goto("https://cushlabs.ai/", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.screenshot(path="/tmp/mobile_hero.png", full_page=False)

    # Also extract the rendered stat bar items so we can verify all 4 are present
    stats = page.locator(".inline-flex.items-center.gap-2.font-display").all_inner_texts()
    print("Mobile stat bar items:")
    for s in stats[:6]:
        if s.strip():
            print(f"  - {s.strip()}")
    browser.close()
print("Screenshot saved to /tmp/mobile_hero.png")

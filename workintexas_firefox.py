"""
WorkInTexas automated login using Playwright (Firefox).
Uses page.pause() for review points — the Playwright Inspector opens
so you can examine the page state before continuing.
"""
import time
from playwright.sync_api import sync_playwright

def review(stage: str):
    """Pause and open Playwright Inspector for manual review."""
    print(f"\n{'='*60}")
    print(f"REVIEW: {stage}")
    print(f"{'='*60}")
    print("Playwright Inspector opened. Click Resume (▶) when ready.")
    # This opens the inspector and pauses until you click Resume
    page.pause()

# Global page reference for review function
page = None

def main():
    global page
    with sync_playwright() as p:
        # Step 1: Launch Firefox browser
        browser = p.firefox.launch(
            headless=False,
            args=["--width=1280", "--height=900"],
            slow_mo=200,  # slow down actions for visibility
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="en-US",
            timezone_id="America/Chicago",
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        print("[1] Firefox launched (visible, slow_mo=200).")

        # Step 2: Navigate to WorkInTexas login page
        print("[2] Navigating to login page...")
        page.goto("https://www.workintexas.com/vosnet/LoginIntro2.aspx?enc=5CDClwJdtOsnyw9fqDO6aA==")
        page.wait_for_load_state("networkidle")
        print(f"    URL: {page.url}")
        review("Page loaded — verify you see the WorkInTexas login form")

        # Step 3: Find and fill username
        print("[3] Locating username field...")
        username_field = page.locator("input[type='text']").first
        username_field.click()
        username_field.fill("")
        username_field.type("scotdwg81", delay=100)
        print("    Username entered: scotdwg81")
        review("Username filled — verify text appears correctly")

        # Step 4: Find and fill password
        print("[4] Locating password field...")
        password_field = page.locator("input[type='password']").first
        password_field.click()
        password_field.fill("")
        password_field.type("Sdweede81$$$", delay=100)
        print("    Password entered.")
        review("Password filled — verify masked input visible")

        # Step 5: Screenshot before submit
        screenshot_path = "/Users/sweeden/profile/workintexas_before_signin.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"[5] Screenshot saved: {screenshot_path}")
        review("Review screenshot — confirm credentials and click readiness")

        # Step 6: Click Sign In
        print("[6] Clicking Sign In button...")
        signin_button = page.get_by_role("button", name="Sign In")
        signin_button.click()
        page.wait_for_load_state("networkidle", timeout=15000)
        print(f"    Post-click URL: {page.url}")
        review("After Sign In click — check if login succeeded, failed, or CAPTCHA appeared")

        # Step 7: Inspect result
        print(f"[7] Final URL: {page.url}")
        print(f"    Title: {page.title()}")
        
        body_text = page.locator("body").inner_text() if page.locator("body").count() > 0 else ""
        if "Access denied" in body_text or "Error 15" in body_text:
            print("    RESULT: BLOCKED by Imperva/Incapsula security.")
        elif "invalid" in body_text.lower() or "incorrect" in body_text.lower():
            print("    RESULT: Invalid credentials message detected.")
        elif "dashboard" in page.url.lower() or "welcome" in body_text.lower():
            print("    RESULT: Login SUCCESS!")
        elif "captcha" in body_text.lower():
            print("    RESULT: CAPTCHA challenge appeared.")
        else:
            print("    RESULT: Unclear — review manually.")

        post_screenshot = "/Users/sweeden/profile/workintexas_after_signin.png"
        page.screenshot(path=post_screenshot, full_page=True)
        print(f"    Post-login screenshot: {post_screenshot}")

        review("Final review — inspect page state before close")

        print("\n[DONE] Closing browser.")
        browser.close()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Tor Browser Scraper

A tool for scraping and interacting with .onion sites through Tor Browser
without JavaScript execution. Designed for solving puzzles on the Tor network.

Requirements:
    - Tor Browser installed and running
    - selenium
    - beautifulsoup4
    - requests[socks]
    - stem (optional, for Tor control)

Usage:
    python tor_browser_scraper.py <onion_url>
"""

import os
import sys
import time
import json
import logging
from typing import Optional, Dict, List, Any
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re

try:
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options as FirefoxOptions
    from selenium.webdriver.firefox.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, WebDriverException
except ImportError:
    print("Error: selenium not installed. Install with: pip install selenium")
    sys.exit(1)

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: beautifulsoup4 not installed. Install with: pip install beautifulsoup4")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TorBrowserScraper:
    """
    Scraper for interacting with Tor Browser and .onion sites.
    
    This scraper:
    - Connects to Tor Browser
    - Disables JavaScript
    - Parses HTML content
    - Handles forms and submissions
    - Manages session state
    """
    
    def __init__(
        self,
        tor_browser_path: Optional[str] = None,
        tor_profile_path: Optional[str] = None,
        headless: bool = False,
        timeout: int = 30
    ):
        """
        Initialize the Tor Browser scraper.
        
        Args:
            tor_browser_path: Path to Tor Browser executable (auto-detected if None)
            tor_profile_path: Path to Tor Browser profile directory
            headless: Run browser in headless mode
            timeout: Default timeout for page loads (seconds)
        """
        self.timeout = timeout
        self.driver: Optional[webdriver.Firefox] = None
        self.current_url: Optional[str] = None
        self.session_state: Dict[str, Any] = {}
        
        # Auto-detect Tor Browser path
        if tor_browser_path is None:
            tor_browser_path = self._find_tor_browser()
        
        if tor_browser_path is None:
            raise FileNotFoundError(
                "Tor Browser not found. Please specify tor_browser_path or "
                "install Tor Browser in a standard location."
            )
        
        self.tor_browser_path = tor_browser_path
        
        # Set up profile path
        if tor_profile_path is None:
            tor_profile_path = self._get_default_profile_path()
        
        self.tor_profile_path = tor_profile_path
        self.headless = headless
        
        logger.info(f"Initialized scraper with Tor Browser at: {tor_browser_path}")
    
    def _find_tor_browser(self) -> Optional[str]:
        """Find Tor Browser installation path."""
        # Common locations
        common_paths = [
            # macOS
            os.path.expanduser("~/Applications/Tor Browser.app/Contents/MacOS/firefox"),
            "/Applications/Tor Browser.app/Contents/MacOS/firefox",
            # Linux
            os.path.expanduser("~/tor-browser/Browser/firefox"),
            "/opt/tor-browser/Browser/firefox",
            # Windows
            os.path.expanduser("~/Desktop/Tor Browser/Browser/firefox.exe"),
            "C:\\Users\\{}\\Desktop\\Tor Browser\\Browser\\firefox.exe".format(os.getenv("USERNAME", "")),
        ]
        
        for path in common_paths:
            if os.path.exists(path):
                logger.info(f"Found Tor Browser at: {path}")
                return path
        
        logger.warning("Tor Browser not found in common locations")
        return None
    
    def _get_default_profile_path(self) -> str:
        """Get default Tor Browser profile path."""
        if sys.platform == "darwin":  # macOS
            base = os.path.expanduser("~/Library/Application Support/TorBrowser-Data/Browser")
        elif sys.platform.startswith("linux"):
            base = os.path.expanduser("~/.tor-browser/profile.default")
        else:  # Windows
            base = os.path.expanduser("~/AppData/Roaming/tor-browser/profile.default")
        
        return base
    
    def start(self) -> None:
        """Start the Tor Browser instance."""
        if self.driver is not None:
            logger.warning("Browser already started")
            return
        
        try:
            # Configure Firefox options for Tor Browser
            options = FirefoxOptions()
            
            # Disable JavaScript
            options.set_preference("javascript.enabled", False)
            
            # Set Tor Browser binary
            options.binary_location = self.tor_browser_path
            
            # Use existing Tor Browser profile
            if os.path.exists(self.tor_profile_path):
                options.profile = self.tor_profile_path
            else:
                logger.warning(f"Profile path not found: {self.tor_profile_path}")
                logger.info("Creating new profile (may not have Tor proxy configured)")
            
            # Additional preferences for scraping
            options.set_preference("dom.webdriver.enabled", False)
            options.set_preference("useAutomationExtension", False)
            options.set_preference("general.useragent.override", 
                                  "Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0")
            
            if self.headless:
                options.add_argument("--headless")
            
            # Create driver
            self.driver = webdriver.Firefox(options=options)
            self.driver.set_page_load_timeout(self.timeout)
            
            logger.info("Tor Browser started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start Tor Browser: {e}")
            raise
    
    def stop(self) -> None:
        """Stop the Tor Browser instance."""
        if self.driver is not None:
            try:
                self.driver.quit()
                logger.info("Tor Browser stopped")
            except Exception as e:
                logger.error(f"Error stopping browser: {e}")
            finally:
                self.driver = None
                self.current_url = None
    
    def navigate(self, url: str, wait_time: float = 2.0) -> bool:
        """
        Navigate to a URL.
        
        Args:
            url: URL to navigate to (can be .onion address)
            wait_time: Time to wait after page load (seconds)
        
        Returns:
            True if navigation successful, False otherwise
        """
        if self.driver is None:
            raise RuntimeError("Browser not started. Call start() first.")
        
        try:
            logger.info(f"Navigating to: {url}")
            self.driver.get(url)
            time.sleep(wait_time)  # Wait for page to load
            self.current_url = self.driver.current_url
            logger.info(f"Successfully loaded: {self.current_url}")
            return True
            
        except TimeoutException:
            logger.error(f"Timeout loading {url}")
            return False
        except WebDriverException as e:
            logger.error(f"Error navigating to {url}: {e}")
            return False
    
    def get_html(self) -> Optional[str]:
        """Get the current page's HTML source."""
        if self.driver is None:
            raise RuntimeError("Browser not started. Call start() first.")
        
        try:
            return self.driver.page_source
        except Exception as e:
            logger.error(f"Error getting HTML: {e}")
            return None
    
    def get_soup(self) -> Optional[BeautifulSoup]:
        """Get BeautifulSoup object for current page."""
        html = self.get_html()
        if html is None:
            return None
        return BeautifulSoup(html, 'html.parser')
    
    def extract_forms(self) -> List[Dict[str, Any]]:
        """
        Extract all forms from the current page.
        
        Returns:
            List of form dictionaries with action, method, and fields
        """
        soup = self.get_soup()
        if soup is None:
            return []
        
        forms = []
        for form in soup.find_all('form'):
            form_data = {
                'action': form.get('action', ''),
                'method': form.get('method', 'GET').upper(),
                'fields': []
            }
            
            # Extract input fields
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                field = {
                    'type': input_tag.get('type', 'text'),
                    'name': input_tag.get('name', ''),
                    'value': input_tag.get('value', ''),
                    'id': input_tag.get('id', ''),
                }
                
                # Get text content for textarea/select
                if input_tag.name in ['textarea', 'select']:
                    field['text'] = input_tag.get_text(strip=True)
                
                form_data['fields'].append(field)
            
            forms.append(form_data)
        
        return forms
    
    def submit_form(
        self,
        form_index: int = 0,
        form_data: Optional[Dict[str, str]] = None,
        wait_time: float = 3.0
    ) -> bool:
        """
        Submit a form on the current page.
        
        Args:
            form_index: Index of form to submit (default: first form)
            form_data: Dictionary of field_name: value to fill in
            wait_time: Time to wait after submission (seconds)
        
        Returns:
            True if submission successful, False otherwise
        """
        if self.driver is None:
            raise RuntimeError("Browser not started. Call start() first.")
        
        try:
            forms = self.driver.find_elements(By.TAG_NAME, "form")
            if form_index >= len(forms):
                logger.error(f"Form index {form_index} out of range")
                return False
            
            form = forms[form_index]
            
            # Fill in form fields
            if form_data:
                for field_name, value in form_data.items():
                    try:
                        # Try by name first
                        field = form.find_element(By.NAME, field_name)
                        field.clear()
                        field.send_keys(str(value))
                    except:
                        # Try by id
                        try:
                            field = form.find_element(By.ID, field_name)
                            field.clear()
                            field.send_keys(str(value))
                        except:
                            logger.warning(f"Could not find field: {field_name}")
            
            # Submit form
            form.submit()
            time.sleep(wait_time)
            self.current_url = self.driver.current_url
            logger.info(f"Form submitted, new URL: {self.current_url}")
            return True
            
        except Exception as e:
            logger.error(f"Error submitting form: {e}")
            return False
    
    def extract_puzzle_state(self) -> Dict[str, Any]:
        """
        Extract puzzle state from the current page.
        
        This is a generic method that looks for common puzzle elements.
        Override or extend for specific puzzle types.
        
        Returns:
            Dictionary containing puzzle state information
        """
        soup = self.get_soup()
        if soup is None:
            return {}
        
        puzzle_state = {
            'url': self.current_url,
            'title': soup.title.string if soup.title else '',
            'forms': self.extract_forms(),
            'tables': [],
            'hidden_inputs': {},
            'data_attributes': {}
        }
        
        # Extract tables (common in puzzles)
        for table in soup.find_all('table'):
            table_data = []
            for row in table.find_all('tr'):
                cells = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
                if cells:
                    table_data.append(cells)
            if table_data:
                puzzle_state['tables'].append(table_data)
        
        # Extract hidden inputs (often contain puzzle state)
        for hidden in soup.find_all('input', type='hidden'):
            name = hidden.get('name', '')
            value = hidden.get('value', '')
            if name:
                puzzle_state['hidden_inputs'][name] = value
        
        # Extract data attributes
        for element in soup.find_all(attrs=lambda x: x and any(k.startswith('data-') for k in x.keys())):
            for attr, value in element.attrs.items():
                if attr.startswith('data-'):
                    puzzle_state['data_attributes'][attr] = value
        
        return puzzle_state
    
    def save_state(self, filepath: str) -> None:
        """Save current session state to file."""
        state = {
            'current_url': self.current_url,
            'session_state': self.session_state,
            'timestamp': time.time()
        }
        
        with open(filepath, 'w') as f:
            json.dump(state, f, indent=2)
        
        logger.info(f"State saved to: {filepath}")
    
    def load_state(self, filepath: str) -> None:
        """Load session state from file."""
        with open(filepath, 'r') as f:
            state = json.load(f)
        
        self.session_state = state.get('session_state', {})
        logger.info(f"State loaded from: {filepath}")
    
    def __enter__(self):
        """Context manager entry."""
        self.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()


def main():
    """Main entry point for command-line usage."""
    if len(sys.argv) < 2:
        print("Usage: python tor_browser_scraper.py <onion_url> [options]")
        print("\nOptions:")
        print("  --headless    Run browser in headless mode")
        print("  --timeout N   Set page load timeout (seconds)")
        print("  --profile PATH  Path to Tor Browser profile")
        sys.exit(1)
    
    url = sys.argv[1]
    headless = '--headless' in sys.argv
    timeout = 30
    
    if '--timeout' in sys.argv:
        idx = sys.argv.index('--timeout')
        if idx + 1 < len(sys.argv):
            timeout = int(sys.argv[idx + 1])
    
    profile_path = None
    if '--profile' in sys.argv:
        idx = sys.argv.index('--profile')
        if idx + 1 < len(sys.argv):
            profile_path = sys.argv[idx + 1]
    
    # Create scraper
    scraper = TorBrowserScraper(headless=headless, timeout=timeout, tor_profile_path=profile_path)
    
    try:
        scraper.start()
        
        # Navigate to URL
        if scraper.navigate(url):
            # Extract puzzle state
            puzzle_state = scraper.extract_puzzle_state()
            
            # Print results
            print("\n=== Puzzle State ===")
            print(json.dumps(puzzle_state, indent=2))
            
            # Save state
            output_file = "puzzle_state.json"
            scraper.save_state(output_file)
            print(f"\nState saved to: {output_file}")
        else:
            print("Failed to navigate to URL")
            sys.exit(1)
    
    except KeyboardInterrupt:
        print("\nInterrupted by user")
    except Exception as e:
        logger.error(f"Error: {e}")
        sys.exit(1)
    finally:
        scraper.stop()


if __name__ == "__main__":
    main()

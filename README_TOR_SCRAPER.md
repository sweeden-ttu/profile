# Tor Browser Scraper

A Python tool for scraping and interacting with `.onion` sites through Tor Browser without JavaScript execution. Designed for solving puzzles on the Tor network.

## Features

- **Tor Browser Integration**: Connects to Tor Browser for anonymous browsing
- **JavaScript Disabled**: Works with pure HTML/CSS, no JavaScript execution
- **Form Handling**: Automatically extracts and submits HTML forms
- **Puzzle State Extraction**: Extracts puzzle state from HTML elements
- **Session Management**: Saves and loads session state
- **Robust Error Handling**: Handles Tor network latency and failures

## Installation

### Prerequisites

1. **Tor Browser**: Download and install from [torproject.org](https://www.torproject.org/download/)

2. **Python Dependencies**:
```bash
pip install -r requirements_tor_scraper.txt
```

3. **GeckoDriver**: Required for Selenium Firefox automation
```bash
# macOS
brew install geckodriver

# Linux
# Download from https://github.com/mozilla/geckodriver/releases
# Add to PATH

# Windows
# Download from https://github.com/mozilla/geckodriver/releases
# Add to PATH
```

## Usage

### Basic Usage

```python
from tor_browser_scraper import TorBrowserScraper

# Create scraper instance
scraper = TorBrowserScraper()

# Start browser
scraper.start()

try:
    # Navigate to .onion site
    scraper.navigate("http://example.onion")
    
    # Extract puzzle state
    puzzle_state = scraper.extract_puzzle_state()
    print(puzzle_state)
    
    # Extract forms
    forms = scraper.extract_forms()
    print(f"Found {len(forms)} forms")
    
    # Submit a form
    scraper.submit_form(form_index=0, form_data={"answer": "solution"})
    
finally:
    # Always stop the browser
    scraper.stop()
```

### Context Manager Usage

```python
from tor_browser_scraper import TorBrowserScraper

with TorBrowserScraper() as scraper:
    scraper.navigate("http://example.onion")
    puzzle_state = scraper.extract_puzzle_state()
    # Browser automatically stops when exiting context
```

### Command Line Usage

```bash
# Basic usage
python tor_browser_scraper.py http://example.onion

# Headless mode
python tor_browser_scraper.py http://example.onion --headless

# Custom timeout
python tor_browser_scraper.py http://example.onion --timeout 60

# Custom profile path
python tor_browser_scraper.py http://example.onion --profile ~/tor-profile
```

## API Reference

### TorBrowserScraper

#### `__init__(tor_browser_path=None, tor_profile_path=None, headless=False, timeout=30)`

Initialize the scraper.

- `tor_browser_path`: Path to Tor Browser executable (auto-detected if None)
- `tor_profile_path`: Path to Tor Browser profile directory
- `headless`: Run browser in headless mode
- `timeout`: Default timeout for page loads (seconds)

#### `start()`

Start the Tor Browser instance. Must be called before other methods.

#### `stop()`

Stop the Tor Browser instance and clean up resources.

#### `navigate(url, wait_time=2.0) -> bool`

Navigate to a URL. Returns `True` if successful.

#### `get_html() -> str`

Get the current page's HTML source.

#### `get_soup() -> BeautifulSoup`

Get BeautifulSoup object for parsing the current page.

#### `extract_forms() -> List[Dict]`

Extract all forms from the current page. Returns list of form dictionaries with:
- `action`: Form action URL
- `method`: HTTP method (GET/POST)
- `fields`: List of form fields with type, name, value, id

#### `submit_form(form_index=0, form_data=None, wait_time=3.0) -> bool`

Submit a form on the current page.

- `form_index`: Index of form to submit (0 = first form)
- `form_data`: Dictionary of `field_name: value` to fill in
- `wait_time`: Time to wait after submission

#### `extract_puzzle_state() -> Dict`

Extract puzzle state from the current page. Returns dictionary with:
- `url`: Current page URL
- `title`: Page title
- `forms`: List of forms (from `extract_forms()`)
- `tables`: List of tables with cell data
- `hidden_inputs`: Dictionary of hidden input values
- `data_attributes`: Dictionary of data-* attributes

#### `save_state(filepath)`

Save current session state to JSON file.

#### `load_state(filepath)`

Load session state from JSON file.

## Example: Solving a Puzzle

```python
from tor_browser_scraper import TorBrowserScraper

scraper = TorBrowserScraper()
scraper.start()

try:
    # Navigate to puzzle page
    scraper.navigate("http://puzzle-site.onion/challenge1")
    
    # Extract puzzle state
    state = scraper.extract_puzzle_state()
    
    # Analyze puzzle (implement your solver logic)
    solution = solve_puzzle(state)
    
    # Submit solution
    scraper.submit_form(
        form_index=0,
        form_data={"solution": solution}
    )
    
    # Check result
    new_state = scraper.extract_puzzle_state()
    print("Result:", new_state)
    
finally:
    scraper.stop()
```

## Tor Browser Path Detection

The scraper automatically searches for Tor Browser in common locations:

- **macOS**: `~/Applications/Tor Browser.app/Contents/MacOS/firefox`
- **Linux**: `~/tor-browser/Browser/firefox`
- **Windows**: `~/Desktop/Tor Browser/Browser/firefox.exe`

If Tor Browser is installed elsewhere, specify the path:

```python
scraper = TorBrowserScraper(tor_browser_path="/custom/path/to/firefox")
```

## Troubleshooting

### "Tor Browser not found"

1. Install Tor Browser from [torproject.org](https://www.torproject.org/download/)
2. Or specify the path manually: `TorBrowserScraper(tor_browser_path="/path/to/firefox")`

### "GeckoDriver not found"

Install GeckoDriver and add it to your PATH:
```bash
brew install geckodriver  # macOS
# Or download from https://github.com/mozilla/geckodriver/releases
```

### Timeout errors

Tor network can be slow. Increase timeout:
```python
scraper = TorBrowserScraper(timeout=60)
```

### Connection failures

- Ensure Tor Browser is running
- Check that Tor network is accessible
- Try requesting a new Tor circuit
- Increase wait times between requests

## Security Considerations

- **Anonymity**: This tool uses Tor Browser for anonymity, but be aware that automation can create fingerprints
- **Rate Limiting**: Implement delays between requests to avoid overwhelming servers
- **Ethical Use**: Only use for legitimate purposes and respect site terms of service
- **No JavaScript**: JavaScript is disabled, which may limit some functionality but improves security

## Limitations

- Requires Tor Browser to be installed
- JavaScript is disabled (by design)
- Slower than regular web scraping due to Tor latency
- Some sites may detect automation

## Contributing

To extend the scraper:

1. **Add puzzle solvers**: Create specialized solvers in `solvers/` directory
2. **Extend extraction**: Override `extract_puzzle_state()` for specific puzzle types
3. **Add utilities**: Create helper functions in `utils/` directory

## License

This tool is for educational purposes. Use responsibly and ethically.

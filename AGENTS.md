# Agent Instructions - Spring Semester

## General Guidelines

### Semester Context
This is the **Spring Semester** of the academic year. Agents should be aware of:
- Course progression from fall semester foundations
- Mid-semester project deadlines
- Final project planning and execution phases
- Integration of concepts across multiple courses

### Workflow Principles

1. **Parallel Processing**: Multiple agents can work simultaneously on different tasks
2. **Cross-Review**: Agents should review each other's work for quality and consistency
3. **Iterative Refinement**: Work through multiple drafts with feedback loops
4. **Documentation First**: Always document approach, decisions, and outcomes

### Quality Standards

- **Code**: Well-documented, tested, and follows project conventions
- **Documentation**: Clear, comprehensive, and accessible to others
- **Projects**: Complete with examples, challenges, and learning outcomes
- **Blog Posts**: 15-minute reading time, well-structured, with diagrams and examples

### Communication

- Use clear, descriptive commit messages
- Document assumptions and design decisions
- Flag blockers or ambiguities early
- Share progress updates regularly

---

## Project: Tor Network Puzzle Challenge

### Project Overview

**Title**: Tor Network Puzzle Solver  
**Status**: Active Development  
**Tech Stack**: Python, Tor Browser, Web Scraping, Network Security  
**Challenge Level**: Advanced

### Project Description

This project involves creating an automated system to solve puzzles and challenges hosted on the Tor network (`.onion` sites) using the Tor Browser. The key constraint is that **JavaScript must be disabled** - all interactions must work with pure HTML/CSS, requiring creative problem-solving approaches.

### Challenge Objectives

1. **Tor Network Navigation**
   - Connect to `.onion` sites through Tor Browser
   - Handle Tor's unique network characteristics (latency, circuit changes)
   - Navigate without JavaScript execution

2. **Puzzle Solving**
   - Parse HTML-based puzzles and challenges
   - Extract puzzle state from DOM elements
   - Solve puzzles algorithmically (logic puzzles, pattern recognition, etc.)
   - Submit solutions through HTML forms

3. **Automation**
   - Automate Tor Browser interactions
   - Handle dynamic content loading without JavaScript
   - Manage session state across page navigations
   - Implement retry logic for network instability

4. **Security & Privacy**
   - Maintain anonymity through Tor
   - Avoid fingerprinting techniques
   - Respect rate limits and ethical scraping practices
   - Handle CAPTCHAs and anti-automation measures

### Technical Challenges

#### Challenge 1: JavaScript-Free Interaction
**Problem**: Modern web puzzles often rely on JavaScript for interactivity.  
**Approach**: 
- Parse static HTML for puzzle state
- Use form submissions for state changes
- Extract data from hidden form fields, data attributes, and CSS classes
- Reconstruct puzzle logic from HTML structure

#### Challenge 2: Tor Network Latency
**Problem**: Tor circuits introduce significant latency and occasional failures.  
**Approach**:
- Implement robust retry mechanisms with exponential backoff
- Cache puzzle states locally to avoid re-fetching
- Use connection pooling where possible
- Monitor circuit health and request new circuits when needed

#### Challenge 3: Dynamic Content Without JavaScript
**Problem**: Some puzzles update content dynamically.  
**Approach**:
- Parse server-rendered HTML updates
- Use form submissions to trigger server-side state changes
- Extract puzzle state from response HTML
- Maintain client-side puzzle state representation

#### Challenge 4: Puzzle Type Diversity
**Problem**: Different puzzle types require different solving strategies.  
**Approach**:
- Modular puzzle solver architecture
- Pattern recognition for puzzle classification
- Specialized solvers for common puzzle types (Sudoku, logic grids, pattern matching)
- Extensible framework for adding new puzzle types

### Project Structure

```
tor-puzzle-solver/
├── scraper/
│   ├── tor_browser_scraper.py    # Main scraper implementation
│   ├── tor_connection.py          # Tor connection management
│   └── puzzle_extractor.py        # HTML parsing and puzzle extraction
├── solvers/
│   ├── base_solver.py             # Abstract base solver
│   ├── logic_solver.py            # Logic puzzle solver
│   ├── pattern_solver.py          # Pattern recognition solver
│   └── sudoku_solver.py           # Sudoku solver
├── utils/
│   ├── html_parser.py             # HTML parsing utilities
│   ├── form_handler.py            # Form submission handling
│   └── state_manager.py           # Session state management
├── config/
│   ├── tor_config.json            # Tor browser configuration
│   └── solver_config.json         # Solver parameters
├── tests/
│   ├── test_scraper.py
│   ├── test_solvers.py
│   └── test_integration.py
└── README.md
```

### Success Criteria

- [ ] Successfully connect to `.onion` sites through Tor Browser
- [ ] Extract puzzle state from HTML without JavaScript
- [ ] Solve at least 3 different puzzle types
- [ ] Submit solutions through HTML forms
- [ ] Handle network failures gracefully
- [ ] Maintain anonymity and avoid detection
- [ ] Document all puzzle types and solving strategies

### Learning Outcomes

- Deep understanding of Tor network architecture
- HTML parsing and DOM manipulation without JavaScript
- Web scraping in constrained environments
- Algorithmic puzzle solving
- Network programming with high latency
- Security and privacy considerations

### Ethical Considerations

- Respect robots.txt and site terms of service
- Implement rate limiting to avoid overwhelming servers
- Use puzzles for educational purposes only
- Maintain privacy and anonymity
- Do not use for malicious purposes

### Resources

- [Tor Project Documentation](https://www.torproject.org/docs/)
- [Tor Browser Manual](https://tb-manual.torproject.org/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Selenium with Tor](https://selenium-python.readthedocs.io/)

---

## Additional Spring Semester Projects

### Project Tracking

Agents should maintain awareness of:
- Active project status
- Upcoming deadlines
- Resource requirements
- Dependencies between projects

### Collaboration

- Share reusable components across projects
- Document common patterns and solutions
- Review code for quality and security
- Provide feedback on project approaches

---

## Notes for Agents

When working on projects:
1. **Start with research**: Understand the domain and constraints
2. **Prototype early**: Build minimal working examples
3. **Iterate**: Refine based on testing and feedback
4. **Document**: Write clear documentation as you go
5. **Test**: Create comprehensive test suites
6. **Review**: Get peer review before finalizing

When encountering blockers:
- Document the issue clearly
- Research potential solutions
- Propose alternatives
- Seek input from other agents

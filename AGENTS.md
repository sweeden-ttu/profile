# Agent Instructions - Spring Semester

## General Guidelines

### Semester Context
This is the **Spring Semester** of the academic year. Agents should be aware of:
- Course progression from fall semester foundations
- Mid-semester project deadlines
- Final project planning and execution phases
- Integration of concepts across multiple courses

### Jekyll Static Site Configuration

**Build Output**: The Jekyll static site builds to the `_site` directory. This is the default Jekyll output location where all generated HTML, CSS, and assets are placed after running `jekyll build` or `jekyll serve`.

**Important**: 
- Never commit the `_site` directory to version control (it's in `.gitignore`)
- The site is built from source files in `_posts`, `_projects`, `_courses`, `_drafts`, etc.
- Always work with source files, not the generated `_site` output

### Blog Post Creation from Canvas Course Materials

**Canvas LMS Integration**: Blog entries should follow specific texts from lecture and module notes downloaded using the **canvas-lms-mcp server** (user-canvas-lms MCP server).

**Workflow for Blog Posts**:
1. **Access Course Materials**: Use the Canvas LMS MCP tools to:
   - List courses: `canvas_list_courses` to get course IDs
   - Get modules: `canvas_get_modules` to retrieve course module structure
   - List module items: `canvas_list_module_items` to access files, assignments, and lecture materials
   - Download files: `canvas_get_file_download_url` or `canvas_get_course_file` to retrieve lecture notes, PDFs, and module content

2. **Extract Content**: 
   - Parse downloaded lecture notes and module materials
   - Follow the specific text and structure from Canvas materials
   - Maintain accuracy to source material while adapting for blog format

3. **Create Blog Posts**:
   - Use course information from the `_courses` collection (see below)
   - Reference specific module numbers, lecture dates, and topics from Canvas
   - Include proper attribution and links back to Canvas course materials

4. **Quality Standards**:
   - Blog posts should accurately reflect the content from Canvas lecture and module notes
   - Maintain academic integrity by properly citing source materials
   - Follow the blog post generation instructions in `BLOG_POST_GENERATION_INSTRUCTIONS.md`

### Course Data Dictionary (`_data/courses.yaml`)

The official source of truth for all course information is `_data/courses.yaml`. This file contains course metadata synced from Canvas LMS and **rarely changes throughout the semester**.

**IMPORTANT**: This YAML file should be used by agents and MCP server lookups for course metadata. Course information in this file is stable and does not need to be re-fetched from Canvas during normal operations.

**Course Data Structure**:
```yaml
- slug: cryptography                    # URL-safe identifier
  display_name: "Cryptography"          # User-facing name (NO course numbers!)
  course_number: "CS-6343"              # Internal use only (agents/MCP)
  canvas_id: 70714                      # Internal use only (agents/MCP)
  enrollment_term_id: 140               # Canvas term ID
  semester: "Spring 2026"
  status: active                        # active or completed
  completed: false
  description: "..."                    # Course description
  syllabus_url: "..."                   # Link to Canvas syllabus
  calendar_ics: "..."                   # iCal feed URL
  tags: [...]                           # Course tags
```

**Current Courses** (from `_data/courses.yaml`):

| Display Name | Course Number | Canvas ID | Semester | Status |
|--------------|---------------|-----------|----------|--------|
| Cryptography | CS-6343 | 70714 | Spring 2026 | Active |
| Software Verification and Validation | CS-5374 | 70713 | Spring 2026 | Active |
| Intelligent Systems | CS-5368 | 58606 | Fall 2025 | Completed |
| Logic for Computer Scientists | CS-5384 | 53482 | Fall 2025 | Completed |
| Theory of Automata | CS-5383 | 51243 | Fall 2025 | Completed |
| Analysis of Algorithms | CS-5381 | 37735 | Summer 2025 | Completed |
| Software Project Management | CS-5363 | 37196 | Summer 2025 | Completed |
| Machine Learning Security | CS-5331 | 38308 | Summer 2025 | Completed |

**Course Naming Convention**:
- **User-facing content** (blog titles, page headers, navigation): Use `display_name` only, **never include course numbers**
- **Internal/agent use**: Course numbers and Canvas IDs are for agents and MCP lookups only
- See `.cursor/rules/course-naming-convention.mdc` for detailed guidelines

**Using Course Data in Jekyll**:
```liquid
{% assign course = site.data.courses | where: "slug", "cryptography" | first %}
{{ course.display_name }}  <!-- "Cryptography" -->
{{ course.canvas_id }}     <!-- 70714 (for agent use) -->
```

**When to Update `_data/courses.yaml`**:
- Only update at the start of a new semester
- Only update when new courses are added
- Do NOT re-fetch from Canvas during normal operations - the data is stable

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

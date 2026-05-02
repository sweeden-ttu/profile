# Modular Coursework Architecture

## Overview

This repository has been reorganized into a modular structure using Git submodules to better manage academic coursework across multiple semesters and courses. Each course now has its own standalone Jekyll site with a dedicated subdomain.

## Architecture

### Main Site: `scottweeden.online`
- **Purpose**: Portfolio, semester overviews, and navigation hub
- **Content**: 
  - Course landing pages (summaries with links to detailed content)
  - Semester overview pages (`/courses/spring2026/`, etc.)
  - Non-course specific blog posts
  - Main navigation and cross-site linking
- **Structure**: Monolithic Jekyll site
- **Repository**: `sweeden-ttu/scottweeden.online`

### Course Sites: `course.scottweeden.online`
- **Purpose**: Detailed course materials and content
- **Content**:
  - Lecture notes and slides
  - Assignments and solutions  
  - Projects and implementations
  - Course-specific blog posts
  - Resources and references
- **Structure**: Standalone Jekyll sites with identical themes
- **Examples**:
  - `cryptography.scottweeden.online` → `sweeden-ttu/cryptography`
  - `software-vv.scottweeden.online` → `sweeden-ttu/software-vv`

### Semester Repositories
- **Purpose**: Metadata organization and course listings
- **Content**:
  - `courses.yaml` with course metadata
  - README files with semester overviews
  - Links to individual course repositories
- **Structure**: Meta-repositories (no detailed content)
- **Examples**:
  - `sweeden-ttu/spring-2026`
  - `sweeden-ttu/fall-2025`
  - `sweeden-ttu/summer-2025`

## Directory Structure

```
scottweeden.online/                    # Main repository
├── coursework/                        # Submodule directory
│   ├── spring-2026/                   # Semester submodule
│   ├── fall-2025/                     # Semester submodule  
│   ├── summer-2025/                   # Semester submodule
│   └── courses/                       # Course submodules
│       ├── cryptography/               # Course submodule
│       ├── software-vv/                # Course submodule
│       ├── intelligent-systems/        # Course submodule
│       └── ...                       # Other courses
├── _data/
│   └── courses.yaml                    # Master course index
├── _courses/
│   ├── spring2026.md                  # Semester overview (links to course sites)
│   ├── fall2025.md                    # Semester overview
│   └── summer2025.md                 # Semester overview
└── scripts/                           # Management scripts
    ├── setup-submodules.sh
    └── sync-course-content.sh
```

## Content Migration Strategy (Hybrid Approach)

### Main Site Retains:
- Course metadata and index (`_data/courses.yaml`)
- Semester overview pages
- Course landing pages (summaries + links)
- Navigation structure
- Non-course specific content

### Course Repositories Contain:
- All detailed course materials
- Lecture notes and transcripts
- Assignments and solutions
- Course-specific blog posts
- Projects and implementations
- Course-specific data files

## Workflow

### Adding New Course Content
1. Add content to main site (existing workflow)
2. Run `./scripts/sync-course-content.sh` to migrate to appropriate course repos
3. Commit and push changes to course repositories
4. Course sites will automatically update

### Setting Up New Semester
1. Create semester repository with `courses.yaml`
2. Add individual course repositories
3. Add semester as submodule to main site
4. Update main site navigation and course data

### Cross-Linking
- Main site links to course subdomains
- Course sites link back to main site
- Consistent navigation across all sites
- Breadcrumb navigation for context

## Benefits

1. **Modularity**: Each course is independently manageable
2. **Scalability**: Easy to add new courses and semesters
3. **Performance**: Main site stays lightweight, detailed content loads separately
4. **Flexibility**: Can make courses public/private independently
5. **Maintainability**: Easier to manage large amounts of course content
6. **Development**: Can work on course content independently

## Technical Implementation

### Jekyll Configuration
- Course sites inherit main site theme and styling
- Consistent build settings and plugins
- Custom domains configured per site
- Independent GitHub Pages deployment

### Submodule Management
- Main repository tracks submodule versions
- Easy to update all course sites simultaneously
- Can pin different versions per course if needed
- Maintains clean git history

### Content Synchronization
- Scripts automate content migration
- Maintains consistency across sites
- Handles new content detection and movement
- Commits changes appropriately

## Next Steps

1. **Remote Setup**: Push all repositories to GitHub
2. **Submodule Configuration**: Set up Git submodules properly
3. **Domain Configuration**: Set up DNS records for subdomains
4. **GitHub Pages**: Configure automatic deployment for all sites
5. **CI/CD**: Set up automated build and deployment pipelines
6. **Content Migration**: Complete migration of remaining course content

## Management Commands

```bash
# Set up all submodules (after pushing to GitHub)
./scripts/setup-submodules.sh

# Sync new content from main site to course repos
./scripts/sync-course-content.sh

# Update all submodules to latest versions
git submodule update --remote

# Commit submodule updates
git add .gitmodules coursework/
git commit -m "Update course submodules"
```
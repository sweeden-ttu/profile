# Coursework Organization

This directory contains the modular structure for academic coursework using Git submodules.

## Structure

```
coursework/
├── spring-2026/          # Spring 2026 semester repository
│   ├── README.md
│   └── courses.yaml
├── fall-2025/            # Fall 2025 semester repository  
│   ├── README.md
│   └── courses.yaml
├── summer-2025/          # Summer 2025 semester repository
│   ├── README.md
│   └── courses.yaml
└── courses/               # Individual course repositories
    ├── cryptography/                      # cryptography.scottweeden.online
    ├── software-vv/                      # software-vv.scottweeden.online
    ├── intelligent-systems/               # intelligent-systems.scottweeden.online
    ├── logic-for-computer-scientists/     # logic-for-computer-scientists.scottweeden.online
    ├── theory-of-automata/               # theory-of-automata.scottweeden.online
    ├── analysis-of-algorithms/            # analysis-of-algorithms.scottweeden.online
    ├── software-project-management/        # software-project-management.scottweeden.online
    └── machine-learning-security/         # machine-learning-security.scottweeden.online
```

## Workflow

1. **Main Site** (`scottweeden.online`): 
   - Course overviews and navigation
   - Links to individual course sites
   - Non-course specific blog posts

2. **Course Sites** (`course.scottweeden.online`):
   - Complete course materials
   - Lecture notes and assignments
   - Independent Jekyll sites with their own domains

3. **Semester Repositories**:
   - Metadata and organization
   - Course listings by semester
   - No detailed content (meta-repositories)

## Submodule Management

After pushing repositories to GitHub, use these commands to set up submodules:

```bash
# Add semester submodules
git submodule add https://github.com/sweeden-ttu/spring-2026.git coursework/spring-2026
git submodule add https://github.com/sweeden-ttu/fall-2025.git coursework/fall-2025  
git submodule add https://github.com/sweeden-ttu/summer-2025.git coursework/summer-2025

# Add course submodules
git submodule add https://github.com/sweeden-ttu/cryptography.git coursework/courses/cryptography
git submodule add https://github.com/sweeden-ttu/software-vv.git coursework/courses/software-vv
git submodule add https://github.com/sweeden-ttu/intelligent-systems.git coursework/courses/intelligent-systems
# ... continue for all courses
```

## Next Steps

1. Push all repositories to GitHub
2. Configure GitHub Pages for each course repository
3. Set up custom domains (DNS records)
4. Configure CI/CD pipelines
5. Update main site navigation to link to course subdomains
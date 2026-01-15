# GitHub Issue Templates

This directory contains issue templates for tracking academic work and blog post completion.

## Available Templates

### 1. Complete Cryptography Blogs
**File**: `complete-cryptography-blogs.md`
- **Purpose**: Track completion of Cryptography blog posts
- **Status**: 7 draft posts pending completion
- **Labels**: blog, cryptography, content, spring-2026

### 2. Complete Software Verification Blogs
**File**: `complete-software-validation-blogs.md`
- **Purpose**: Track completion of Software Verification and Validation blog posts
- **Status**: 7 draft posts pending completion
- **Labels**: blog, software-verification, content, spring-2026

### 3. Complete Logic Homework Assignment
**File**: `complete-logic-homework.md`
- **Purpose**: Track completion of Logic for Computer Scientists homework
- **Status**: Homework 3 (or current assignment) pending
- **Labels**: homework, logic, assignment, fall-2025

### 4. Schedule Intelligent Systems Final Exam
**File**: `schedule-intelligent-systems-final.md`
- **Purpose**: Plan and schedule final exam preparation for Intelligent Systems
- **Status**: Planning phase
- **Labels**: exam, intelligent-systems, planning, spring-2026

## How to Use

### Option 1: GitHub Web Interface
1. Go to your repository on GitHub
2. Click "Issues" tab
3. Click "New issue"
4. GitHub will automatically show these templates
5. Select the appropriate template
6. Fill in any additional details
7. Submit the issue

### Option 2: Manual Creation
1. Copy the content from any template file
2. Go to GitHub Issues
3. Click "New issue"
4. Paste the content
5. Adjust labels and details as needed
6. Submit the issue

### Option 3: GitHub CLI
```bash
# Create an issue from a template
gh issue create --title "Complete Cryptography Blog Posts" \
  --body-file .github/ISSUE_TEMPLATE/complete-cryptography-blogs.md \
  --label "blog,cryptography"
```

## Template Structure

Each template includes:
- **Frontmatter**: YAML metadata for GitHub (name, about, labels)
- **Overview**: High-level description
- **Course Information**: Course details and status
- **Requirements**: Detailed checklist of tasks
- **Resources**: Reference materials and files
- **Deliverables**: Expected outcomes
- **Acceptance Criteria**: Definition of done
- **Timeline**: Important dates
- **Notes**: Additional context

## Customization

To customize templates:
1. Edit the `.md` files in this directory
2. Adjust labels, requirements, or structure as needed
3. Templates will be automatically available in GitHub

## Notes

- Templates use standard GitHub issue template format
- Frontmatter (YAML) is required for GitHub to recognize templates
- Labels can be adjusted based on your repository's label structure
- All dates and specific details should be filled in when creating the issue
- Course numbers are used internally only - use display names in user-facing content

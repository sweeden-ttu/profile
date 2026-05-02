#!/bin/bash

# Script to sync content between main site and course repositories
# Use this to update course content when new material is added to main site

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

COURSEWORK_DIR="/home/cursor/profile/coursework"
COURSES_DIR="$COURSEWORK_DIR/courses"

# Course mappings (main site patterns -> course repo)
declare -A COURSE_MAPPINGS=(
    ["cryptography"]="courses/cryptography"
    ["software-verification"]="courses/software-vv" 
    ["intelligent-systems"]="courses/intelligent-systems"
    ["logic-for-computer-scientists"]="courses/logic-for-computer-scientists"
    ["theory-of-automata"]="courses/theory-of-automata"
    ["analysis-of-algorithms"]="courses/analysis-of-algorithms"
    ["software-project-management"]="courses/software-project-management"
    ["machine-learning-security"]="courses/machine-learning-security"
)

echo -e "${GREEN}Syncing course content to repositories...${NC}"

# Function to sync content for a specific course
sync_course_content() {
    local course_name=$1
    local target_repo=$2
    
    echo -e "${YELLOW}Syncing $course_name content...${NC}"
    
    # Find posts for this course
    if ls /home/cursor/profile/_posts/*$course_name* 1> /dev/null 2>&1; then
        echo -e "  Moving posts to $target_repo/_posts/"
        cp /home/cursor/profile/_posts/*$course_name* "$COURSEWORK_DIR/$target_repo/_posts/" 2>/dev/null || true
    fi
    
    # Find drafts for this course
    if ls /home/cursor/profile/_drafts/*$course_name* 1> /dev/null 2>&1; then
        echo -e "  Moving drafts to $target_repo/_posts/"
        cp /home/cursor/profile/_drafts/*$course_name* "$COURSEWORK_DIR/$target_repo/_posts/" 2>/dev/null || true
    fi
    
    # Find lectures for this course
    if ls /home/cursor/profile/_lectures/*$course_name* 1> /dev/null 2>&1; then
        echo -e "  Moving lectures to $target_repo/_lectures/"
        cp /home/cursor/profile/_lectures/*$course_name* "$COURSEWORK_DIR/$target_repo/_lectures/" 2>/dev/null || true
    fi
    
    # Find assignments for this course
    if [ -d "/home/cursor/profile/_assignments/$course_name" ]; then
        echo -e "  Moving assignments to $target_repo/_assignments/"
        cp -r "/home/cursor/profile/_assignments/$course_name/"* "$COURSEWORK_DIR/$target_repo/_assignments/" 2>/dev/null || true
    fi
    
    # Find course-specific data
    if [ -d "/home/cursor/profile/_data/$course_name-lectures" ]; then
        echo -e "  Moving data to $target_repo/_data/"
        cp -r "/home/cursor/profile/_data/$course_name-lectures/"* "$COURSEWORK_DIR/$target_repo/_data/" 2>/dev/null || true
    fi
    
    # Commit changes if any
    cd "$COURSEWORK_DIR/$target_repo"
    if git status --porcelain | grep -q .; then
        git add .
        git commit -m "Sync content from main site - $(date)"
        echo -e "${GREEN}  ✓ Committed changes for $course_name${NC}"
    else
        echo -e "  No changes to commit for $course_name"
    fi
}

# Sync each course
for course_pattern in "${!COURSE_MAPPINGS[@]}"; do
    sync_course_content "$course_pattern" "${COURSE_MAPPINGS[$course_pattern]}"
done

echo -e "${GREEN}Content sync complete!${NC}"
echo -e "${YELLOW}To push changes:${NC}"
echo "cd coursework/courses/[course-name] && git push"
echo ""
echo -e "${YELLOW}Or to push all courses:${NC}"
echo "for course in coursework/courses/*/; do cd \"\$course\" && git push; cd -; done"
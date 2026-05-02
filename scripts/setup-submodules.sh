#!/bin/bash

# Script to set up all submodules for the coursework modular structure
# Run this after pushing all repositories to GitHub

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up coursework submodules...${NC}"

# Check if we're in the right directory
if [ ! -f "_config.yml" ]; then
    echo -e "${RED}Error: Must be run from main site root directory${NC}"
    exit 1
fi

# Create coursework directory if it doesn't exist
mkdir -p coursework/courses

# Function to add submodule safely
add_submodule() {
    local repo_name=$1
    local repo_url=$2
    local target_path=$3
    
    echo -e "${YELLOW}Adding submodule: $repo_name${NC}"
    
    if [ -d "$target_path" ]; then
        echo -e "${YELLOW}Directory $target_path exists, removing...${NC}"
        rm -rf "$target_path"
    fi
    
    git submodule add "$repo_url" "$target_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Added $repo_name${NC}"
    else
        echo -e "${RED}✗ Failed to add $repo_name${NC}"
    fi
}

# Add semester submodules
add_submodule "spring-2026" "https://github.com/sweeden-ttu/spring-2026.git" "coursework/spring-2026"
add_submodule "fall-2025" "https://github.com/sweeden-ttu/fall-2025.git" "coursework/fall-2025"  
add_submodule "summer-2025" "https://github.com/sweeden-ttu/summer-2025.git" "coursework/summer-2025"

# Add course submodules
add_submodule "cryptography" "https://github.com/sweeden-ttu/cryptography.git" "coursework/courses/cryptography"
add_submodule "software-vv" "https://github.com/sweeden-ttu/software-vv.git" "coursework/courses/software-vv"
add_submodule "intelligent-systems" "https://github.com/sweeden-ttu/intelligent-systems.git" "coursework/courses/intelligent-systems"
add_submodule "logic-for-computer-scientists" "https://github.com/sweeden-ttu/logic-for-computer-scientists.git" "coursework/courses/logic-for-computer-scientists"
add_submodule "theory-of-automata" "https://github.com/sweeden-ttu/theory-of-automata.git" "coursework/courses/theory-of-automata"
add_submodule "analysis-of-algorithms" "https://github.com/sweeden-ttu/analysis-of-algorithms.git" "coursework/courses/analysis-of-algorithms"
add_submodule "software-project-management" "https://github.com/sweeden-ttu/software-project-management.git" "coursework/courses/software-project-management"
add_submodule "machine-learning-security" "https://github.com/sweeden-ttu/machine-learning-security.git" "coursework/courses/machine-learning-security"

# Initialize and update submodules
echo -e "${GREEN}Initializing and updating submodules...${NC}"
git submodule update --init --recursive

# Commit the changes
echo -e "${GREEN}Committing submodule changes...${NC}"
git add .gitmodules coursework/
git commit -m "Add coursework submodules for modular site structure"

echo -e "${GREEN}Submodule setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run 'git push' to push submodule changes"
echo "2. Configure GitHub Pages for each course repository"
echo "3. Set up DNS records for custom domains"
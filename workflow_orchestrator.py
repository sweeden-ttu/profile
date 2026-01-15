#!/usr/bin/env python3
"""
Multi-Agent Blog Post Generation Workflow Orchestrator

This script manages the two-agent parallel processing system for converting
lecture materials into publication-ready blog posts.

Usage:
    python workflow_orchestrator.py --agent [a|b|both] --action [status|next|advance]
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any, List

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
AGENT_A_STATE_DIR = PROJECT_ROOT / "agent_a_state"
AGENT_B_STATE_DIR = PROJECT_ROOT / "agent_b_state"
POSTS_DIR = PROJECT_ROOT / "_posts"


class AgentState:
    """Manages agent state loading and updating."""
    
    def __init__(self, agent_id: str):
        self.agent_id = agent_id
        self.state_dir = AGENT_A_STATE_DIR if agent_id == "a" else AGENT_B_STATE_DIR
        self.state_file = self.state_dir / f"agent_{agent_id}_state.json"
        self.inventory_file = self.state_dir / "lecture_inventory.json"
        self.state: Dict[str, Any] = {}
        self.inventory: Dict[str, Any] = {}
        
    def load(self) -> bool:
        """Load agent state from file."""
        try:
            with open(self.state_file, 'r') as f:
                self.state = json.load(f)
            with open(self.inventory_file, 'r') as f:
                self.inventory = json.load(f)
            return True
        except FileNotFoundError as e:
            print(f"Error: State file not found: {e}")
            return False
        except json.JSONDecodeError as e:
            print(f"Error: Invalid JSON in state file: {e}")
            return False
    
    def save(self) -> bool:
        """Save agent state to file."""
        try:
            self.state["updated_at"] = datetime.now().isoformat() + "Z"
            with open(self.state_file, 'w') as f:
                json.dump(self.state, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving state: {e}")
            return False
    
    def get_current_lecture(self) -> Dict[str, Any]:
        """Get current lecture info."""
        return self.state.get("current_lecture", {})
    
    def get_progress(self) -> Dict[str, Any]:
        """Get progress info."""
        return self.state.get("progress", {})
    
    def get_completed_lectures(self) -> List[Dict[str, Any]]:
        """Get list of completed lectures."""
        return self.state.get("completed_lectures", [])
    
    def get_lecture_queue(self) -> List[Dict[str, Any]]:
        """Get lecture queue."""
        return self.state.get("lecture_queue", [])


class WorkflowOrchestrator:
    """Orchestrates the multi-agent workflow."""
    
    PHASES = [
        "initialization",
        "extraction",
        "planning",
        "drafting",
        "reviewing",
        "refining",
        "finalizing",
        "complete"
    ]
    
    def __init__(self):
        self.agent_a = AgentState("a")
        self.agent_b = AgentState("b")
    
    def load_agents(self) -> bool:
        """Load both agent states."""
        a_loaded = self.agent_a.load()
        b_loaded = self.agent_b.load()
        return a_loaded and b_loaded
    
    def print_status(self, agent: Optional[str] = None):
        """Print status of one or both agents."""
        if agent in [None, "a", "both"]:
            self._print_agent_status(self.agent_a)
        if agent in [None, "b", "both"]:
            self._print_agent_status(self.agent_b)
    
    def _print_agent_status(self, agent: AgentState):
        """Print detailed status for an agent."""
        state = agent.state
        current = agent.get_current_lecture()
        progress = agent.get_progress()
        
        print("\n" + "="*60)
        print(f"AGENT {agent.agent_id.upper()}: {state.get('course', 'Unknown')}")
        print("="*60)
        print(f"Status: {state.get('status', 'unknown')}")
        print(f"\nCurrent Lecture:")
        print(f"  Number: {current.get('number', 'N/A')}")
        print(f"  Title: {current.get('title', 'N/A')}")
        print(f"  Folder: {current.get('folder', 'N/A')}")
        print(f"  Status: {current.get('status', 'N/A')}")
        print(f"  Iteration: {current.get('iteration', 0)}")
        print(f"  Peer Review: {current.get('peer_review_status', 'pending')}")
        print(f"\nProgress:")
        print(f"  Completed: {progress.get('completed', 0)}/{progress.get('total_lectures', 0)}")
        print(f"  Pending: {progress.get('pending_lectures', 0)}")
        print(f"\nCompleted Lectures:")
        for lec in agent.get_completed_lectures()[-5:]:  # Show last 5
            print(f"  - {lec.get('title', 'Unknown')}")
        print(f"\nPending Actions:")
        for action in state.get('pending_actions', []):
            print(f"  • {action}")
        print(f"\nLast Updated: {state.get('updated_at', 'Unknown')}")
    
    def get_next_phase(self, agent: AgentState) -> str:
        """Determine the next phase for an agent."""
        current_status = agent.state.get("status", "initialization")
        current_lecture_status = agent.get_current_lecture().get("status", "pending")
        
        if current_status == "batch_processing" and current_lecture_status == "pending":
            return "extraction"
        
        phase_map = {
            "initialization": "extraction",
            "extracting": "planning",
            "planning": "drafting",
            "drafting": "reviewing",
            "reviewing": "refining",
            "refining": "finalizing",
            "finalizing": "complete"
        }
        
        return phase_map.get(current_status, "extraction")
    
    def generate_phase_prompt(self, agent: AgentState, phase: str) -> str:
        """Generate the prompt for a specific phase."""
        current = agent.get_current_lecture()
        course = agent.state.get("course", "Unknown")
        course_path = agent.state.get("course_path", "Unknown")
        agent_id = "A" if agent.agent_id == "a" else "B"
        
        prompts = {
            "extraction": self._extraction_prompt(agent_id, current, course, course_path),
            "planning": self._planning_prompt(agent_id, current, course),
            "drafting": self._drafting_prompt(agent_id, current, course),
            "reviewing": self._reviewing_prompt(agent_id, current, course),
            "refining": self._refining_prompt(agent_id, current, course),
            "finalizing": self._finalizing_prompt(agent_id, current, course)
        }
        
        return prompts.get(phase, f"Unknown phase: {phase}")
    
    def _extraction_prompt(self, agent_id: str, lecture: Dict, course: str, course_path: str) -> str:
        return f"""
=== PHASE 1: CONTENT EXTRACTION ===

Agent: {agent_id}
Course: {course}
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}
Path: {course_path}/Lectures/{lecture.get('folder', '')}

TASK: Extract all content from lecture materials.

STEPS:
1. List all files in the lecture folder
2. Parse PDF slides - extract text, formulas, diagrams
3. Parse JSON metadata - topics, exercises, references
4. Parse transcripts if available
5. Create extraction document

OUTPUT: agent_{agent_id.lower()}_state/extractions/{lecture.get('folder', 'unknown')}_extracted.md

SUCCESS CRITERIA:
- [ ] All PDFs processed
- [ ] All topics identified
- [ ] Exercises captured
- [ ] Diagrams described
- [ ] Extraction file created

When complete, update status and proceed to PLANNING phase.
"""
    
    def _planning_prompt(self, agent_id: str, lecture: Dict, course: str) -> str:
        return f"""
=== PHASE 2: LESSON PLAN GENERATION ===

Agent: {agent_id}
Course: {course}
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}

INPUT: agent_{agent_id.lower()}_state/extractions/{lecture.get('folder', 'unknown')}_extracted.md

TASK: Create comprehensive lesson plan for 15-minute blog post.

STEPS:
1. Analyze topic dependencies
2. Order topics logically (basic → advanced)
3. Allocate reading time per section (~2250 words total)
4. Plan visual elements
5. Include exercises

OUTPUT: agent_{agent_id.lower()}_state/plans/{lecture.get('folder', 'unknown')}_lesson_plan.md

SUCCESS CRITERIA:
- [ ] All topics included
- [ ] Logical progression
- [ ] 15-minute reading time
- [ ] Visuals planned
- [ ] Plan file created

When complete, proceed to DRAFTING phase.
"""
    
    def _drafting_prompt(self, agent_id: str, lecture: Dict, course: str) -> str:
        return f"""
=== PHASE 3: CONTENT DRAFTING ===

Agent: {agent_id}
Course: {course}
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}

INPUT: 
- Lesson plan: agent_{agent_id.lower()}_state/plans/{lecture.get('folder', 'unknown')}_lesson_plan.md
- Extraction: agent_{agent_id.lower()}_state/extractions/{lecture.get('folder', 'unknown')}_extracted.md

TASK: Write complete blog post draft.

REQUIREMENTS:
- Jekyll frontmatter with layout, title, date, categories, tags, excerpt
- Introduction (2-3 paragraphs)
- Main content sections following lesson plan
- KaTeX math: $inline$ and $$display$$
- Diagrams (Mermaid) and tables
- Exercises with solutions
- 3-5 external resources
- Conclusion

TARGETS:
- Word count: 2000-2500
- Reading time: 15 minutes
- Diagrams: 1+ per major topic

OUTPUT: agent_{agent_id.lower()}_state/drafts/{lecture.get('folder', 'unknown')}_draft_v1.md

When complete, signal: "Draft ready for review: {lecture.get('folder', 'unknown')}"
"""
    
    def _reviewing_prompt(self, agent_id: str, lecture: Dict, course: str) -> str:
        peer_id = "B" if agent_id == "A" else "A"
        return f"""
=== PHASE 4: CROSS-REVIEW ===

Reviewer: Agent {agent_id}
Author: Agent {peer_id}
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}

INPUT: agent_{peer_id.lower()}_state/drafts/[lecture]_draft_v1.md

TASK: Review peer's draft for quality, accuracy, completeness.

REVIEW CHECKLIST:
□ Accuracy: Definitions, formulas, examples correct
□ Completeness: All topics covered, exercises included
□ Readability: Clear flow, terms defined, examples explained
□ Visuals: Diagrams clear, tables formatted, code highlighted
□ Structure: Frontmatter complete, headings logical

OUTPUT: agent_{agent_id.lower()}_state/reviews/[lecture]_review_v1.md

Use REVIEW_TEMPLATE.md format with:
- Critical issues (must fix)
- Moderate issues (should fix)
- Minor issues (nice to have)
- Strengths
- Priority actions

When complete, signal: "Review complete: [lecture_id], feedback in [path]"
"""
    
    def _refining_prompt(self, agent_id: str, lecture: Dict, course: str) -> str:
        peer_id = "B" if agent_id == "A" else "A"
        iteration = lecture.get('iteration', 1)
        return f"""
=== PHASE 5: ITERATIVE REFINEMENT ===

Agent: {agent_id}
Iteration: {iteration}/3
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}

INPUT:
- Draft: agent_{agent_id.lower()}_state/drafts/{lecture.get('folder', 'unknown')}_draft_v{iteration}.md
- Feedback: agent_{peer_id.lower()}_state/reviews/{lecture.get('folder', 'unknown')}_review_v{iteration}.md

TASK: Address feedback and improve draft.

STEPS:
1. Read all feedback
2. Prioritize: critical → moderate → minor
3. Apply fixes systematically
4. Verify quality maintained
5. Create updated draft

OUTPUT: agent_{agent_id.lower()}_state/drafts/{lecture.get('folder', 'unknown')}_draft_v{iteration + 1}.md

DECISION:
- If critical issues remain → Request re-review
- If only minor changes → Move to finalization
- If iteration {iteration} >= 3 → Move to finalization with notes

SUCCESS CRITERIA:
- [ ] All critical issues addressed
- [ ] Quality maintained
- [ ] Word count in range
- [ ] Updated draft created
"""
    
    def _finalizing_prompt(self, agent_id: str, lecture: Dict, course: str) -> str:
        return f"""
=== PHASE 6: FINALIZATION ===

Agent: {agent_id}
Course: {course}
Lecture: {lecture.get('folder', 'Unknown')} - {lecture.get('title', 'Unknown')}

TASK: Finalize and publish blog post.

FINAL CHECKS:
□ Word count: 2000-2500
□ Reading time: 15 minutes ±2
□ Diagrams: 1+ per major topic
□ External resources: 3-5 links
□ Math notation: KaTeX syntax
□ Peer review: Approved

STEPS:
1. Verify all quality standards
2. Ensure frontmatter complete
3. Format filename: YYYY-MM-DD-title-slug.md
4. Copy to _posts/ directory
5. Update agent state

OUTPUT: _posts/YYYY-MM-DD-{lecture.get('title', 'unknown').lower().replace(' ', '-')}.md

STATE UPDATE:
- Mark current lecture complete
- Add to completed_lectures
- Advance to next lecture
- Update progress counts

When complete: "Lecture {lecture.get('folder', 'unknown')} complete and published"
"""
    
    def print_next_action(self, agent: Optional[str] = None):
        """Print the next action for one or both agents."""
        if agent in [None, "a", "both"]:
            self._print_next_action(self.agent_a)
        if agent in [None, "b", "both"]:
            self._print_next_action(self.agent_b)
    
    def _print_next_action(self, agent: AgentState):
        """Print next action for an agent."""
        next_phase = self.get_next_phase(agent)
        prompt = self.generate_phase_prompt(agent, next_phase)
        
        print("\n" + "="*60)
        print(f"NEXT ACTION FOR AGENT {agent.agent_id.upper()}")
        print("="*60)
        print(prompt)
    
    def advance_phase(self, agent_id: str) -> bool:
        """Advance an agent to the next phase."""
        agent = self.agent_a if agent_id == "a" else self.agent_b
        current_status = agent.state.get("status", "initialization")
        
        # Determine next status
        status_progression = {
            "initialization": "batch_processing",
            "batch_processing": "batch_processing",  # Status stays, lecture status changes
            "extracting": "planning",
            "planning": "drafting",
            "drafting": "reviewing",
            "reviewing": "refining",
            "refining": "finalizing",
            "finalizing": "complete"
        }
        
        next_status = status_progression.get(current_status, current_status)
        agent.state["status"] = next_status
        agent.state["updated_at"] = datetime.now().isoformat() + "Z"
        
        # Update current lecture status
        current_lecture = agent.state.get("current_lecture", {})
        lecture_status_map = {
            "pending": "in_progress",
            "in_progress": "review_pending",
            "review_pending": "revising",
            "revising": "complete"
        }
        current_lecture_status = current_lecture.get("status", "pending")
        current_lecture["status"] = lecture_status_map.get(current_lecture_status, current_lecture_status)
        agent.state["current_lecture"] = current_lecture
        
        return agent.save()


def print_help():
    """Print help information."""
    print("""
Multi-Agent Blog Post Generation Workflow Orchestrator
======================================================

Usage:
    python workflow_orchestrator.py [OPTIONS]

Options:
    --agent [a|b|both]      Select agent(s) to operate on (default: both)
    --action [ACTION]       Action to perform

Actions:
    status                  Show current status of agent(s)
    next                    Show next action/prompt for agent(s)
    advance                 Advance agent(s) to next phase
    prompt [PHASE]          Generate prompt for specific phase
    help                    Show this help message

Phases:
    extraction              Content extraction phase
    planning                Lesson plan generation
    drafting                Blog post drafting
    reviewing               Cross-review phase
    refining                Iterative refinement
    finalizing              Publication finalization

Examples:
    python workflow_orchestrator.py --agent a --action status
    python workflow_orchestrator.py --agent both --action next
    python workflow_orchestrator.py --agent b --action prompt drafting
    python workflow_orchestrator.py --agent a --action advance
""")


def main():
    """Main entry point."""
    args = sys.argv[1:]
    
    if not args or "--help" in args or "help" in args:
        print_help()
        return
    
    # Parse arguments
    agent = "both"
    action = "status"
    phase = None
    
    i = 0
    while i < len(args):
        if args[i] == "--agent" and i + 1 < len(args):
            agent = args[i + 1]
            i += 2
        elif args[i] == "--action" and i + 1 < len(args):
            action = args[i + 1]
            i += 2
        elif args[i] == "prompt" and i + 1 < len(args):
            action = "prompt"
            phase = args[i + 1]
            i += 2
        else:
            action = args[i]
            i += 1
    
    # Initialize orchestrator
    orchestrator = WorkflowOrchestrator()
    if not orchestrator.load_agents():
        print("Error: Could not load agent states. Please check state files exist.")
        return
    
    # Execute action
    if action == "status":
        orchestrator.print_status(agent)
    elif action == "next":
        orchestrator.print_next_action(agent)
    elif action == "advance":
        if agent in ["a", "both"]:
            if orchestrator.advance_phase("a"):
                print("Agent A advanced to next phase.")
            else:
                print("Error advancing Agent A.")
        if agent in ["b", "both"]:
            if orchestrator.advance_phase("b"):
                print("Agent B advanced to next phase.")
            else:
                print("Error advancing Agent B.")
    elif action == "prompt" and phase:
        target_agent = orchestrator.agent_a if agent == "a" else orchestrator.agent_b
        print(orchestrator.generate_phase_prompt(target_agent, phase))
    else:
        print(f"Unknown action: {action}")
        print_help()


if __name__ == "__main__":
    main()

# AI Experiments Directory

This directory contains cutting-edge AI experiments structured according to LangSmith file protocols. Each experiment includes:

- **Dataset definitions** (JSON format) following LangSmith schema
- **Experiment documentation** (Markdown) describing the research
- **Evaluation configurations** for running experiments
- **Results analysis** templates

## LangSmith File Protocol Structure

Each experiment follows the LangSmith dataset format:

```json
{
  "id": "unique-experiment-id",
  "name": "Experiment Name",
  "description": "Brief description",
  "created_at": "ISO timestamp",
  "inputs": {
    "key": "value"
  },
  "outputs": {
    "expected_output": "value"
  },
  "attachments": {
    "attachment_name": {
      "mime_type": "application/pdf",
      "data": "base64_or_bytes"
    }
  },
  "metadata": {
    "tags": ["tag1", "tag2"],
    "source": "research-paper-url"
  }
}
```

## Experiments

### 1. Interact-RAG: Active Retrieval Manipulation
**Status**: Active
**Focus**: Transforming LLM agents from passive query issuers to active manipulators of retrieval processes

### 2. MA-RAG: Multi-Agent Retrieval-Augmented Generation
**Status**: Active
**Focus**: Collaborative specialized AI agents for complex information-seeking tasks

### 3. SIRAG: Stable and Interpretable RAG
**Status**: Active
**Focus**: Process-supervised multi-agent framework bridging retriever and generator components

### 4. FROAV: Framework for RAG Observation and Agent Verification
**Status**: Active
**Focus**: Open-source platform for LLM-based agent workflow development and evaluation

### 5. Agent Lightning: RL Training for LLM Agents
**Status**: Active
**Focus**: Reinforcement learning-based training framework for large language model agents

### 6. Multi-Agent System Evaluation
**Status**: Active
**Focus**: Comprehensive analysis of multi-agent AI systems including LangChain

## Usage

Each experiment directory contains:
- `dataset.json` - LangSmith-compatible dataset definition
- `experiment.md` - Detailed experiment documentation
- `evaluation.py` - Python evaluation script (if applicable)
- `results/` - Directory for experiment results and analysis

## References

- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangChain Documentation](https://python.langchain.com/)
- Research papers cited in individual experiment documentation

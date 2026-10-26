---
name: docs_qa
description: Answers questions about the local docs corpus using the lookup tool, with a citation.
triggers: [according to the docs, docs, ollama, evidently, port, license]
tools: [lookup]
output: text
---
Answer only from the documentation. Search it with the lookup tool first, then answer in
one sentence and cite the doc id in square brackets, e.g. [d2]. If the docs do not
contain the answer, say "not in the docs".

# Claude Certified Architect — Foundations

A standalone, scenario-first study site for the Claude Certified Architect — Foundations (CCAR-F) exam. It follows the same hash-routed course format as the backend and DSA sites in this workspace.

The course follows the current official five-domain blueprint:

1. Agentic Architecture & Orchestration — 27%
2. Tool Design & MCP Integration — 18%
3. Claude Code Configuration & Workflows — 20%
4. Prompt Engineering & Structured Output — 20%
5. Context Management & Reliability — 15%

The current published format is 60 questions in 120 minutes, with a scaled passing score of 720. Recheck the official certification page before scheduling because policies and formats may change.

It also contains an implementation-patterns section with reference configurations and code-level nuances for tool loops, MCP scope, policy gates, structured-output validation, subagent handoffs, CI, and evaluation. The course includes original decision drills and 25 original multiple-choice questions with answer reasoning. They teach how to choose an architecture from scenario constraints; they are not copied or reconstructed exam questions.

Run locally:

```sh
python3 -m http.server 4179 --directory claude-architect-foundations
```

Open `http://localhost:4179/`.

# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Context
- **Lead Engineer:** Alexander "Sasha" Kuznetsov (L5 SWE)
- **Hardware:** Apple M4 Pro (64GB) for local dev; vast.ai / Lambda Labs / Cloud for heavy compute.
- **Workflow:** AI-first development with Obsidian-backed documentation.

# Directory Layout
| Path | Purpose |
|---|---|
| `src/` | All source code |
| `tests/` | All tests |
| `docs/01_Specs/` | Design docs and PRDs |
| `docs/02_Architecture/` | Architecture decision records |
| `docs/03_Agent_Logs/` | Agent task tracking and brainstorming scratchpad |

# Guiding Principles
- **Compute Orchestration:** Prototype on local MLX/Metal; structure for vast.ai/Lambda scaling.
- **Conciseness:** Provide high-signal, low-noise responses.
- **Documentation:** Every feature must have a corresponding `.md` spec in `docs/`.

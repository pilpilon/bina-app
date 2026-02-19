---
description: Initialize a new AI App project using the Global Blueprint
---
# 🚀 Project Ignition Workflow

1.  **Analyze Request**:
    - Identify `[Project Name]`, `[One-Liner]`, and `[Target Audience]` from the user's prompt.
    - If missing, ASK the user for these details before proceeding.

2.  **Scaffold Project Documents**:
    - Create `BLUEPRINT.md` in the current working directory.
    - Copy the structure from `GLOBAL_BLUEPRINT.md`, replacing placeholders (`[APP_NAME]`, etc.) with actual values.
    - Add the **Configuration Table** and **Ignition Block** at the top.

3.  **Initialize Task List**:
    - Create `task.md` with the 9-Phase Checklist from `GLOBAL_BLUEPRINT.md`.
    - Mark **Phase 1 (Market Research)** as `[/]` (In Progress).
    - Add specific tasks:
        - [ ] Research Competitors
        - [ ] Identify Market Gaps
        - [ ] Define "Killer Feature"

4.  **Execute Phase 1**:
    - Begin **Market Research** immediately.
    - Use `search_web` to analyze 3 top competitors.
    - Create `MARKET_RESEARCH.md` with findings.

5.  **Report**:
    - Notify user that the project is initialized and research has started.

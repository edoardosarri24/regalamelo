# Agent Instructions and Operational Guidelines
This file contains specific instructions for the agent working on the `gift-list` project.

## 1. Workflow & Interaction
### Strategic vs. Operational Tasks
To balance safety and velocity, distinguish between these two types of actions:
* **Critical Decisions (STOP & ASK):** You **MUST** get explicit approval before:
    * Choosing or changing the tech stack (e.g., Database type, Frameworks).
    * Defining communication protocols (e.g., REST vs GraphQL, Auth flow).
    * Defining high-level architectural patterns.
    * *Step 0 applies here:* Present the idea, explain the "why", and wait for the "OK".
* **Operational Tasks (PROCEED & INFORM):** You can proceed **WITHOUT** waiting for approval for:
    * Drafting or expanding documentation files (LaTeX) based on previously agreed concepts.
    * Implementing code for features that are already fully described in `/documentation`.
    * Refactoring code for cleanliness (English names, semantic comments) without changing logic.
    * *Action:* Just state what you are doing and execute.

### The "No-Go" Rule (Code Implementation)
* **Strict Blocking:** If the user asks for code implementation for a feature not yet documented in `documentation/**`, you **MUST** refuse.
* **The Proactive Proposal:** Instead of just refusing, immediately propose a **draft/outline** of the documentation in the chat and ask: *"I've prepared a draft for the documentation; if it looks good, I'll write the .tex files and then we can move to the code."*

### Documentation First
* **Sequence:** No code before documentation. 
* **Focus:** Documentation must focus on the **concept** and **logic**. Avoid specific implementation details (class names) unless necessary for architectural clarity.

## 2. Operational Constraints (CRITICAL)
* **No Auto-Commit:** Do **NOT** perform git commits after making changes. The agent should limit its actions to modifying or creating files. Version control is managed by the user.
* **No LaTeX Compilation:** Do **NOT** attempt to compile LaTeX files (e.g., via `pdflatex` or similar tools). The agent is responsible for the source code (`.tex`) only.

## 3. Coding Standards
### Language & Style
* **English Only:** All code and technical identifiers must be in English.
* **Semantic Comments:** Explain the *logic* and *business reason* (the "why"), not the syntax. Code should be clean and self-explanatory.

## 4. Technical & Environment Hints
* **LaTeX Handling:** Ensure valid syntax. Respect the project structure (`main.tex`, `src/`, etc.). Use `% LOGIC:` for semantic comments in LaTeX.
* **Containerization (MANDATORY):** Do **NOT** install any dependencies (databases, runtimes, libraries) directly on the host system. 
* **Docker First:** All components must be containerized. Use `Dockerfile` and `docker-compose.yaml` for managing the environment.
* **Context Awareness:** Always scan `documentation/**` before proposing any change to ensure consistency with the existing architecture.

## 5. Cross-Cutting Concerns (Always Consider)
* **Security:** Data protection, Auth/Authz, and input validation by design.
* **Logging:** Structured and meaningful logs for debugging and auditing.
* **Deployment:** Keep configuration separate from code; ensure the process is repeatable and environment-agnostic via Docker.
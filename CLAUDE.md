# CLAUDE.md

## Project

This repository is the Solarisx portfolio.

It is an Awwwards-inspired cinematic portfolio built from an existing Vite + React + GSAP + React Three Fiber template.

The goal is NOT to preserve the original template.

The goal is to transform it into the Solarisx experience described in the documentation.

---

# Source of Truth

Before making design decisions, always read:

docs/START_HERE.md

Follow the reading order defined there.

The documentation is canonical.

If implementation conflicts with documentation:

- documentation wins
- unless the user explicitly says otherwise

Do not invent new design systems.

Do not create speculative documentation.

---

# Implementation Philosophy

Prioritize:

1. correctness
2. maintainability
3. simplicity
4. reuse

Never duplicate animation systems.

Never duplicate design tokens.

Extract reusable abstractions only after repetition naturally appears.

---

# Workflow

For every implementation task:

1. Read the relevant documentation.
2. Explain the implementation plan.
3. Make the smallest coherent change.
4. Run the build.
5. Fix any errors.
6. Summarize what changed.

Never stop after editing files without verifying the project builds.

---

# Design Rules

The project follows the canonical documentation.

Hierarchy, composition, motion, transitions, spacing and typography come from the documentation.

Do not invent alternatives.

If documentation appears contradictory:

stop and ask.

---

# Coding Style

Prefer:

- functional React components
- reusable hooks
- composition over inheritance
- small focused files

Avoid:

- unnecessary abstraction
- duplicated constants
- magic numbers
- dead code

---

# Existing Stack

- React
- Vite
- GSAP
- React Three Fiber
- Tailwind
- Drei

---

# Before finishing any task

Always:

- run npm run build
- verify there are no TypeScript/build errors
- summarize every modified file

Never claim something works unless it has been verified.

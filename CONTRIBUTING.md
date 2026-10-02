# Contributing to NextGen Collar

Welcome to the NextGen Collar codebase. This document outlines setup, branch conventions, and development practices for contributors.

## 1. Quickstart & Local Setup
- Requires Node.js (v20+) and npm.
- Clone the repository and run `npm install`.
- Set up your `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Run `npm run dev` to start the local Vite server.

## 2. Branching Strategy
- `main` is production-ready.
- Use descriptive branch names: `feat/...`, `fix/...`, `chore/...`.
- Follow conventional commits for clear history.

## 3. Lovable and GitHub Workflow
- Always pull/sync GitHub changes into Lovable before making visual prompts.
- Review commits from Lovable bots to prevent unintentional regressions.
- GitHub remains the single source of truth for all production code.

## 4. Coding Standards
- TypeScript: Maintain strict typing.
- Styling: Use Tailwind utility classes and HSL design tokens.
- Validation: Ensure `npm run build` completes without errors before merging.

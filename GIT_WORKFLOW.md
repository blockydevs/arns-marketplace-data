# Git Workflow & Branching Strategy

This document outlines the standard Git workflow for our project.

## 1. Branching Model

We follow a simplified Gitflow-like model with `main` and `develop` as our primary long-lived branches.

*   **`main` Branch:**
    *   Represents the **production-ready** code.
    *   **Protected:** No direct pushes are allowed.
    *   Only merges from the `develop` branch are permitted, typically for releases.

*   **`develop` Branch:**
    *   Serves as the **integration branch** for all new features and bug fixes.
    *   **Protected:** No direct pushes are allowed.
    *   All new work must be merged into `develop` via a Pull Request (PR) from dedicated feature/fix branches.

*   **Feature/Fix/Hotfix Branches:**
    *   **Purpose:** Where all active development takes place.
    *   **Creation:** Always branched off `develop` (for features/fixes) or `main` (for critical hotfixes).
    *   **Naming Convention:**
        *   `feature/your-feature-name` (e.g., `feature/AM-123-new-login`)
        *   `fix/your-bug-fix-name` (e.g., `fix/AM-456-broken-button`)
        *   `hotfix/critical-issue` (only from `main`)

## 2. Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to ensure consistent and meaningful commit messages, which aids in changelog generation and understanding project history.

*   **Format:** `<type>(<scope>): <subject>`
*   **Example:**
    *   `feat: add new user registration flow`
    *   `fix(auth): correct password reset bug`
    *   `chore: update dependencies`
    *   `docs: update README with new API endpoint`

### CI Enforcement (`commitlint`)

Our CI pipeline includes a `commitlint` check that runs on every Pull Request targeting the `develop` branch.
This action ensures that all commit messages within your PR adhere to the Conventional Commits specification.
If any commit message in your PR violates the rules, the CI check will fail, and the PR cannot be merged until corrected.
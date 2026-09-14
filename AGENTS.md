# AGENTS.md

Instructions for AI coding agents working in this repository.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit message
(e.g. `feat: add X`, `fix: correct Y`, `chore: update Z`, `test: add coverage for W`).

This repository uses [release-please](https://github.com/googleapis/release-please) (see
`release-please-config.json`) to determine version bumps and generate `CHANGELOG.md` entries
directly from commit types, so non-conventional commit messages will be missed or
miscategorized in releases.

# **ADR-0005** TypeScript Package Management Selection

**Author**: Pierre Fouilloux

![Accepted](https://img.shields.io/badge/status-accepted-green) ![Date](https://img.shields.io/badge/Date-18_Feb_2025-lightblue)

## Context and Problem Statement

Following ADR-0004's selection of TypeScript, we need to choose a package manager for dependency management. The package manager should provide fast, reliable installations while being efficient with disk space across multiple projects.

## Considered Options

* pnpm
* npm
* Yarn

## Decision Outcome

Chosen option: "**pnpm**", because it provides superior disk space efficiency through content-addressable storage, faster installations, and strict dependency management while maintaining compatibility with the npm ecosystem.

### Consequences

* Good, because saves disk space by sharing dependencies across projects
* Good, because provides deterministic installations with lockfile
* Good, because faster than npm and Yarn Classic
* Good, because prevents dependency hoisting issues
* Bad, because less common than npm or Yarn
* Bad, because requires additional setup in some CI environments

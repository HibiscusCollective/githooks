# **ADR0001** Test framework selection

**Author**: pfouilloux

![status-proposed](https://img.shields.io/badge/status-proposed-lightgrey) ![Date](https://img.shields.io/badge/Date-15_Feb_2025-lightblue)

## Context and Problem Statement

We needed a reliable and lightweight test framework to validate the functionality of Git hooks managed by `lefthook`. The framework should be easy to integrate, support shell scripting, and provide clear output for debugging.

## Decision Drivers

* **Ease of Integration**: The framework should work seamlessly with shell scripts used in Git hooks.
* **Lightweight**: The framework should not introduce significant overhead to the development workflow.
* **Clarity**: The framework should provide clear and concise test output for debugging.
* **Community Support**: The framework should have active community support and documentation.

## Considered Options

* **BATS (Bash Automated Testing System)**
* **ShellSpec**
* **shUnit2**

## Decision Outcome

Chosen option: **BATS**, because it is specifically designed for testing Bash scripts, is lightweight, and has a straightforward syntax. It also provides clear output and has active community support.

### Consequences

* Good, because BATS is well-suited for testing shell scripts and integrates easily with `lefthook`.
* Good, because it provides clear and readable test output, making debugging easier.
* Neutral, because it requires some familiarity with its syntax, but the learning curve is manageable.

### Confirmation

The implementation can be confirmed by running the test suite in `spec/lefthook.bats` and verifying that all tests pass. Additionally, the test output should be clear and actionable.

## Pros and Cons of the Options

### BATS

* Good, because it is specifically designed for Bash scripts.
* Good, because it has a simple and readable syntax.
* Good, because it provides clear and concise test output.

### ShellSpec

* Good, because it supports a more modern syntax and features.
* Bad, because it introduces additional complexity for our use case.

### shUnit2

* Good, because it is a mature and widely used framework.
* Bad, because it has a steeper learning curve and less readable output compared to BATS.

## Implementation Details

### Assertion Libraries

* **bats-assert**: Standard assertion functions
* **bats-support**: Test output formatting utilities
* **bats-file**: Filesystem assertions

### Dependency Management

All BATS dependencies are version-pinned via `mise.toml` to ensure:

* Reproducible test environments
* Controlled dependency updates
* Clear compatibility requirements

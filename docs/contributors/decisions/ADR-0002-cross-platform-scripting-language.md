# **ADR-0002** Cross-Platform Scripting Language Selection

![Accepted](https://img.shields.io/badge/status-accepted-green) ![Date](https://img.shields.io/badge/Date-16_Feb_2025-lightblue)

## Context and Problem Statement

We need a cross-platform scripting language for Lefthook commands that:

* Works consistently across Linux/macOS/Windows
* Has minimal runtime requirements
* Integrates well with mise for dependency management
* Supports simple system interactions

## Decision Drivers

* **Mise Availability**: Must be installable via mise
* **Cross-Platform Support**: Consistent behavior across OSes
* **Runtime Footprint**: Minimal disk/memory requirements
* **Error Handling**: Clear failure modes for CI/CD pipelines

## Considered Options

* Lua 5.4
* Ruby 3.2
* TypeScript 5.3 (Node.js 20)

## Decision Outcome

Chosen option: **Ruby 3.2**, because it provides reliable mise integration while maintaining cross-platform compatibility and developer familiarity.

### Consequences

* Good, because integrates seamlessly with mise version management
* Good, because rich standard library for system interactions  
* Good, because familiar to DevOps practitioners
* Bad, because larger runtime footprint (~10MB)
* Bad, because slower startup than Lua alternatives

## Pros and Cons of the Options

### Lua 5.4

Minimal embedded scripting language

* Good, because <5ms startup time
* Good, because native cross-platform support
* Good, because simple error handling with exit codes
* Bad, because limited standard library
* Bad, because dynamic typing only

### Ruby 3.2

Full-featured scripting language

* Good, because rich standard library
* Good, because familiar to DevOps engineers
* Bad, because ~10MB runtime footprint
* Bad, because slower startup (~50ms)
* Bad, because version conflicts common

### TypeScript 5.3

Strongly-typed JavaScript variant

* Good, because strong type safety
* Good, because access to NPM ecosystem
* Bad, because requires 40MB Node.js runtime
* Bad, because needs compilation step
* Bad, because slow cold starts (~300ms)

## Implementation Evidence

1. Added to mise.toml:

    ```toml
    [tools]
    ruby = "3.2.4"
    ```

2. Sample Lefthook integration:

    ```yaml
    pre-commit:
      commands:
        ensure_{tool}:
          run: lua scripts/ensure_tool.lua {tool}
    ```

3. Verified on:

* [x] Fedora 41 (zsh)
* [ ] macOS Sequoia (zsh)
* [ ] Windows 11 (PowerShell 7)

## More Information

* [Ruby Official Website](https://www.ruby-lang.org/en/)
* [mise Ruby Plugin](https://mise.jdx.dev/config/#ruby)

This decision should be revisited if:

* Ruby becomes unavailable via mise
* New language features are required
* Performance requirements change significantly
* Security vulnerabilities emerge in Ruby runtime

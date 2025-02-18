# **ADR-0004** Revisiting Cross-Platform Scripting Language Selection

**Author**: Pierre Fouilloux

![Accepted](https://img.shields.io/badge/status-accepted-green) ![Date](https://img.shields.io/badge/Date-16_Feb_2025-lightblue)

## Context and Problem Statement

ADR-0002 selected Ruby as our cross-platform scripting language for Lefthook commands. However, practical experience has revealed significant challenges with Ruby setup and mise integration. We need to revisit this decision to ensure a more reliable and maintainable development environment.

Key issues with the current Ruby implementation:

* Inconsistent mise integration experience
* Complex runtime version management
* Development environment setup friction

## Decision Drivers

* **Developer Experience**: Setup and configuration should be straightforward
* **Mise Integration**: Reliable version management through mise
* **Type Safety**: Catch errors at compile time
* **Cross-Platform**: Consistent behavior across Linux/macOS/Windows
* **Toolchain**: Modern development tools and ecosystem

## Considered Options

* TypeScript 5.3 (Node.js 20)
* Ruby 3.2 (current implementation)
* Lua 5.4 (previously considered)

## Decision Outcome

Chosen option: "**TypeScript**", because it provides superior type safety, better development tooling, and more reliable mise integration while maintaining cross-platform compatibility.

### Consequences

* Good, because TypeScript's static typing catches errors before runtime
* Good, because extensive NPM ecosystem provides ready solutions
* Good, because TypeScript tooling (ESLint, Prettier) is mature and well-maintained
* Good, because mise's Node.js support is robust and well-tested
* Bad, because requires Node.js runtime (~40MB)
* Bad, because needs compilation step before execution
* Bad, because cold start times are longer than Ruby

### Confirmation

Implementation can be confirmed by:

1. Successful mise installation of Node.js and TypeScript
2. Passing TypeScript compilation of hook scripts
3. Successful cross-platform execution of compiled hooks
4. Automated tests passing on all supported platforms

## Pros and Cons of the Options

### TypeScript

Modern, statically-typed JavaScript superset with extensive tooling.

* Good, because strong type system prevents runtime errors
* Good, because excellent IDE support and tooling
* Good, because large ecosystem of npm packages
* Good, because familiar to modern developers
* Bad, because requires Node.js runtime
* Bad, because compilation step adds complexity
* Bad, because larger disk footprint than Ruby

### Ruby

Current implementation with known integration challenges.

* Good, because rich standard library
* Good, because familiar to DevOps engineers
* Bad, because mise integration issues
* Bad, because version conflicts common
* Bad, because setup complexity across platforms
* Bad, because dynamic typing allows runtime errors

### Lua

Minimal embedded scripting language.

* Good, because minimal runtime footprint
* Good, because fast startup time
* Good, because simple error handling
* Bad, because limited standard library
* Bad, because less familiar to developers
* Bad, because limited tooling ecosystem

## Implementation Notes

1. Required mise.toml changes:

    ```toml
    [tools]
    node = "20.11.1"
    ```

2. TypeScript configuration:

    ```json
    {
      "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "strict": true
      }
    }
    ```

## Related Decisions

* Supersedes [ADR-0002](ADR-0002-cross-platform-scripting-language.md)

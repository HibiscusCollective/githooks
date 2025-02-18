# **ADR-0006** TypeScript Test Framework Selection

**Author**: Pierre Fouilloux

![Accepted](https://img.shields.io/badge/status-accepted-green) ![Date](https://img.shields.io/badge/Date-18_Feb_2025-lightblue)

## Context and Problem Statement

Following ADR-0004's adoption of TypeScript, we need a testing framework for our git hook utility scripts. The framework must:

* Support TypeScript without complex setup
* Be lightweight and fast-running
* Focus on unit testing (no browser/DOM testing needed)
* Integrate well with our PNPM package management (ADR-0005)

## Decision Drivers

* **TypeScript Integration**: Native TypeScript support without additional transpilation setup
* **Performance**: Fast test execution for git hooks context
* **Setup Complexity**: Minimal configuration required
* **Dependencies**: Lightweight footprint
* **Developer Experience**: Watch mode and clear error reporting

## Considered Options

* Vitest
* Node.js Test Runner
* Tape
* uvu

## Decision Outcome

Chosen option: **Vitest**, because it provides native TypeScript support, excellent developer experience, and modern testing features while maintaining acceptable performance characteristics.

### Consequences

* Good, because zero TypeScript configuration needed
* Good, because built-in coverage reporting
* Good, because watch mode for development
* Good, because compatible with Jest-style assertions (familiar syntax)
* Good, because fast parallel test execution
* Bad, because adds ~15MB to node_modules
* Bad, because requires Node.js v18+

### Confirmation

Implementation can be confirmed by:

1. Successful test execution with TypeScript:

    ```typescript
    import { describe, expect, test } from 'vitest'
    import { validateHook } from './hook-utils'

    describe('git hook validation', () => {
      test('validates hook names', () => {
        expect(validateHook('pre-commit')).toBe(true)
      })
    })
    ```

2. Coverage reporting meeting thresholds:

    ```typescript
    // vitest.config.ts
    export default {
      test: {
        coverage: {
          provider: 'v8',
          reporter: ['text'],
          thresholds: {
            lines: 80,
            functions: 80
          }
        }
      }
    }
    ```

## Pros and Cons of the Options

### Vitest

Modern, Vite-native test runner with first-class TypeScript support.

* Good, because native TypeScript support without configuration
* Good, because built-in coverage reporting
* Good, because watch mode available
* Good, because familiar Jest-like API
* Bad, because 15MB package size
* Bad, because requires modern Node.js

### Node.js Test Runner

Built-in Node.js test runner (node:test).

* Good, because zero additional dependencies
* Good, because part of Node.js standard library
* Bad, because requires TypeScript configuration
* Bad, because basic assertion library
* Bad, because no watch mode

### Tape

Minimal TAP-producing test framework.

* Good, because very lightweight (~2MB)
* Good, because simple API
* Bad, because requires TypeScript setup
* Bad, because limited feature set
* Bad, because no built-in watch mode

### uvu

Ultra-lightweight test runner.

* Good, because extremely fast (0.3s startup)
* Good, because tiny footprint (~1MB)
* Bad, because requires external assertion library
* Bad, because minimal TypeScript documentation
* Bad, because no built-in watch mode

## Implementation Notes

1. Required mise.toml changes:

    ```toml
    [tools]
    vitest = "2.0.0"
    ```

2. Package.json scripts:

    ```json
    {
      "scripts": {
        "test": "vitest",
        "test:watch": "vitest --watch",
        "coverage": "vitest run --coverage"
      }
    }
    ```

## Related Decisions

* Follows [ADR-0004](ADR-0004-revisiting-cross-platform-scripting-language.md) TypeScript adoption
* Follows [ADR-0005](ADR-0005-typescript-package-management-selection.md) PNPM selection

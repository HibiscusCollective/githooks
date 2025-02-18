# **ADR-0007** Adopt tsx TypeScript Runner

**Author**: Pierre Fouilloux

![Accepted](https://img.shields.io/badge/status-accepted-green) ![Date](https://img.shields.io/badge/Date-18_Feb_2025-lightblue)

## Context and Problem Statement

Following ADR-0004's adoption of TypeScript, we need a reliable and efficient way to execute TypeScript git hooks across different platforms. The runner must:

* Work consistently across all major operating systems
* Start quickly for responsive git hooks
* Support modern TypeScript features
* Integrate with our existing toolchain (mise, pnpm)

## Decision Drivers

* **Cross-Platform**: Must work reliably on Windows, macOS, and Linux distributions
* **Performance**: Fast startup time for responsive git hooks
* **Setup Complexity**: Minimal configuration required
* **Security**: Well-maintained with good security practices
* **Maturity**: Production-ready with active maintenance
* **Integration**: Compatible with mise for version management

## Considered Options

* tsx
* ts-node
* esbuild-runner
* swc-node

## Decision Outcome

Chosen option: **tsx**, because it provides the best balance of performance, ease of setup, and cross-platform reliability while maintaining active development and security standards.

### Consequences

* Good, because zero-configuration TypeScript execution
* Good, because 3x faster than ts-node (0.8s vs 2.1s cold start)
* Good, because native ES modules support
* Good, because built-in watch mode for development
* Good, because small package size (4.2MB)
* Bad, because less established than ts-node
* Bad, because requires Node.js 18+

### Confirmation

Implementation can be confirmed by:

1. Cross-platform execution test:

    ```typescript
    #!/usr/bin/env tsx
    // hooks/pre-commit.ts
    import { spawnSync } from 'child_process'
    
    const result = spawnSync('pnpm', ['run', 'lint'], { stdio: 'inherit' })
    process.exit(result.status ?? 1)
    ```

2. Performance benchmarks meeting thresholds:
   * Cold start < 1s
   * Warm start < 0.3s
   * Memory usage < 50MB

## Pros and Cons of the Options

### tsx

Modern, esbuild-powered TypeScript runner.

* Good, because fastest cold start time (0.8s)
* Good, because zero configuration needed
* Good, because active maintenance (38 commits/month)
* Good, because small package size (4.2MB)
* Good, because native ES modules support
* Bad, because newer project (less battle-tested)
* Bad, because requires Node.js 18+

### ts-node

Traditional TypeScript execution environment.

* Good, because mature and widely used
* Good, because extensive documentation
* Good, because large community
* Bad, because slow cold start (2.1s)
* Bad, because large package size (12MB)
* Bad, because complex configuration for modern features

### esbuild-runner

Lightweight esbuild-based runner.

* Good, because very fast (0.9s cold start)
* Good, because minimal size (3.8MB)
* Bad, because archived project
* Bad, because partial TypeScript support
* Bad, because no watch mode

### swc-node

Rust-powered TypeScript/JavaScript compiler.

* Good, because very fast execution (0.7s cold start)
* Good, because full TypeScript support
* Good, because active development
* Bad, because larger package size (6.1MB)
* Bad, because requires Rust toolchain in some cases
* Bad, because configuration complexity

## Implementation Notes

1. Installation via PNPM:

    ```bash
    pnpm add -D tsx
    ```

2. Git hook script template:

    ```typescript
    #!/usr/bin/env tsx
    // hooks/pre-commit.ts
    import { runChecks } from './lib/checks'
    
    async function main() {
      try {
        await runChecks()
        process.exit(0)
      } catch (error) {
        console.error('❌', error.message)
        process.exit(1)
      }
    }
    
    main()
    ```

3. Script permissions:

    ```bash
    chmod +x hooks/*.ts
    ```

## Related Decisions

* Follows [ADR-0004](ADR-0004-revisiting-cross-platform-scripting-language.md) TypeScript adoption
* Follows [ADR-0005](ADR-0005-typescript-package-management-selection.md) PNPM selection
* Follows [ADR-0006](ADR-0006-typescript-test-framework-selection.md) Vitest selection

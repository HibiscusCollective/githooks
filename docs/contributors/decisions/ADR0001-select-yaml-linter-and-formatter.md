# **ADR-0001** YAML Linting and Formatting Tools Selection

**Author**: Pierre Fouilloux

![Accepted](https://img.shields.io/badge/status-accepted-darkgreen) ![Date](https://img.shields.io/badge/Date-16_Feb_2024-lightblue)

## Context and Problem Statement

The project requires a reliable solution for linting and formatting YAML files across various configurations and custom schemas. We need tools that support pre-commit hooks, have libre software licenses, and maintain high security standards. The solution must work effectively in both CLI and IDE environments.

## Decision Drivers

* Need for both linting and formatting capabilities with custom schema support
* Requirement for libre software licenses to ensure software freedom
* Security and active maintenance reputation of the tools
* Integration capabilities with pre-commit hooks and VS Code
* Support for various YAML configurations and custom schemas
* Performance and reliability in CI/CD pipelines

## Considered Options

* yamlfmt (Google's YAML formatter)
* yamllint (Standalone YAML linter)
* RedHat YAML Language Server
* Combined approach: yamlfmt + yamllint

## Decision Outcome

Chosen option: "Combined approach: yamlfmt + yamllint", because it provides comprehensive coverage of both linting and formatting needs while meeting all decision drivers. The combination leverages the strengths of both tools - yamlfmt's secure formatting and yamllint's thorough validation.

### Consequences

* Good, because we get comprehensive YAML validation and formatting capabilities
* Good, because both tools are actively maintained and have strong security features
* Good, because both tools use libre licenses (Apache 2.0 and GPLv3)
* Good, because the solution integrates well with both pre-commit hooks and VS Code
* Bad, because we need to maintain configurations for two separate tools
* Bad, because yamllint's GPLv3 license may have copyleft implications for some projects

### Confirmation

The implementation can be confirmed through:

1. Successful execution of pre-commit hooks with both tools
2. VS Code integration showing proper linting and formatting
3. CI pipeline validation of YAML files
4. Manual verification of formatted and linted YAML files

## Pros and Cons of the Options

### yamlfmt

Google's YAML formatter with built-in linting capabilities

* Good, because it provides secure artifact verification through cosign
* Good, because it's maintained by Google with regular updates
* Good, because it uses the permissive Apache 2.0 license
* Bad, because its linting capabilities are limited
* Bad, because it's a relatively new project with fewer community contributions

### yamllint

Standalone YAML linter with extensive rule configurations

* Good, because it provides comprehensive linting rules
* Good, because it has wide community adoption (3.5k+ GitHub stars)
* Good, because it supports highly customizable configurations
* Bad, because it lacks formatting capabilities
* Bad, because its GPLv3 license may be too restrictive for some projects

### RedHat YAML Language Server

IDE-focused YAML tooling with schema validation

* Good, because it provides excellent IDE integration
* Good, because it includes built-in schema validation
* Good, because it uses the permissive MIT license
* Bad, because it's not suitable for CLI/pre-commit usage
* Bad, because it focuses primarily on IDE features rather than pipeline integration

## More Information

* [yamlfmt GitHub Repository](https://github.com/google/yamlfmt)
* [yamllint GitHub Repository](https://github.com/adrienverge/yamllint)
* Implementation details are available in the pre-commit hooks configuration
* VS Code integration settings are documented in the project's `.vscode/settings.json`

This decision should be revisited if:

* Either tool shows signs of reduced maintenance
* A single tool emerges that provides all required functionality
* License requirements change
* Security concerns arise with either tool

# **ADR-0003** Ruby Test Framework

**Author**: Pierre Fouilloux (@pfouilloux)

![Superceded](https://img.shields.io/badge/status-superceded-purple)
![Superceded Date](https://img.shields.io/badge/Superceded_On-18_Feb_2025-purple)
![Approved Date](https://img.shields.io/badge/Approved_On-17_Feb_2025-lightblue)

## Context and Problem Statement

We require a Ruby testing framework that:

* Is lightweight and has minimal external dependencies
* Receives security updates
* Uses libre software licensing

## Considered Options

* Minitest (Ruby standard library)
* RSpec (third-party gem)

## Decision Outcome

Chosen option: "Minitest" because:

* Ships with Ruby (no dependencies)
* Security updates through Ruby core
* MIT licensed
* Full xUnit capabilities

## Consequences

* Good, because it eliminates gem dependency risks
* Good, because it aligns with Ruby's release cycle
* Neutral, beacuse it requires explicit test setup vs RSpec's DSL

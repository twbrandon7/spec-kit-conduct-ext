# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-04

### Added

- Initial release of the Orchestration Extension
- `speckit.orchestration.run` command — runs the full spec-driven development workflow end-to-end (specify → plan → tasks → implement)
- `speckit.orchestration.plan` command — orchestrates the planning phase (specify → plan → tasks) with human review gates between phases
- Human approval gates between each workflow phase to allow review before proceeding
- Completion summaries after each orchestrated workflow

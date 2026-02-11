# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-11

### Added

- Initial release
- **@gu-corp/ascii-diagram** - Core ASCII to HTML converter
  - Grid-based (方眼紙方式) rendering with SVG lines
  - Full Japanese/CJK character width support
  - Box drawing characters (`┌─┐│└┘├┤┬┴┼` and double-line variants)
  - Arrow highlighting (`→←↑↓▶◀▲▼`)
  - Dark mode support via `prefers-color-scheme`
  - Configurable cell size and class prefix
- **@gu-corp/remark-ascii-diagram** - Remark plugin for Markdown integration
  - Supports `ascii` and `ascii-diagram` code block languages
  - Compatible with Nextra, Docusaurus, and other MDX-based frameworks
- E2E visual regression tests with Playwright
- Comprehensive ASCII diagram guide for AI-assisted creation

### Technical Details

- TypeScript with strict mode
- Dual CJS/ESM output
- Turborepo-based monorepo structure
- Vitest for unit testing
- Playwright for E2E testing

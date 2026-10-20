# Contributing

This project is a research tool. Contributions are welcome for:

- New attack prompts or benchmark tasks
- Additional LLM provider integrations
- Scoring rubric improvements
- Bug reports and fixes

## Getting started

1. Fork the repo and create a feature branch
2. For dataset contributions, follow the schemas in `datasets/README.md`
3. For CLI changes, run the test suite before submitting
4. Open a pull request with a clear description of what changed and why

## Code style

- Python: `ruff` for linting, `black` for formatting
- TypeScript: `eslint` + `prettier`
- Commit messages: conventional commits, one-line titles only

## Responsible use

The attack datasets in this repo are for security research purposes. Do not use them against systems you do not own or have permission to test. See `SECURITY.md` for details.

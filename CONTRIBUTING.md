# Contributing to TRIT (TrinaryVM)

We welcome issues and pull requests that improve the open core. By participating, you agree to follow our Code of Conduct.

## License and IP

- Project license: Apache-2.0 (open core). Enterprise features live in a separate private repository under a commercial license.
- All contributions are made under the Apache-2.0 License unless otherwise stated.

## Contributor Agreement

To protect long-term licensing flexibility for commercial offerings, we require a Contributor License Agreement (CLA) for non-trivial contributions.

- Individuals: sign an Individual CLA
- Companies: sign a Corporate CLA for contributions made in the course of employment

We support common CLA tooling:

- CNCF EasyCLA or CLA Assistant are acceptable automation options.
- Until automation is live, maintainers will request a signed CLA via GitHub checks and review.

If you prefer DCO (Signed-off-by) for small changes, we accept DCO for obvious fixes (docs, typos). Larger changes require a CLA.

## How to Contribute

1. Fork the repo and create a feature branch.
2. Write clear commits and add tests where applicable.
3. Ensure CI passes and lints are clean.
4. Submit a PR describing the change, rationale, and any risks.
5. A maintainer will review and may request changes.

## Development Standards

- TypeScript: strict mode, no `any` types in core packages.
- Security first: avoid introducing dependencies without review.
- Documentation: update relevant docs for any user-facing changes.

## Release Process (overview)

- We cut signed, annotated tags for releases (see `RELEASES.md`).
- Each release must update `RELEASES.md` with highlights and known risks.

## Communication

- Issues: GitHub Issues.
- Security reports: see `SECURITY.md`.

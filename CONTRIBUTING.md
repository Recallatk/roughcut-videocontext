# Contributing

Thanks for your interest in contributing to **VideoContext**!

This is a maintained fork of the original [BBC VideoContext](https://github.com/bbc/VideoContext). We welcome bug reports, documentation improvements, and code contributions.

## Getting started

```bash
git clone https://github.com/Recallatk/roughcut-videocontext.git
cd roughcut-videocontext  # or your fork
npm install
npm test          # run unit tests
npm run build     # build dist/
npm run typecheck  # run TypeScript checks
npm run lint      # run ESLint
```

### Prerequisites

- Node.js 22+
- npm 10+

## Branch workflow

We use **GitHub Flow**:

1. **Fork** the repo (external contributors) or create a branch (maintainers)
2. **Branch** from `main` — use a descriptive name:
   - `fix/seek-regression`
   - `feat/adapter-boundary`
   - `chore/update-deps`
   - `docs/improve-readme`
3. **Make your changes** — keep PRs focused on a single concern
4. **Ensure CI passes** — lint, typecheck, and all tests must be green
5. **Open a Pull Request** against `main`
6. **Squash-merge** once approved — keeps `main` history clean

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add adapter boundary for app integration
fix: restore _element guard in _seek
chore: remove jsdoc, update serve
docs: rewrite contributing guide
test: add cache lifecycle integration tests
```

The prefix tells readers *what kind* of change it is at a glance.

## Pull request guidelines

- **One concern per PR** — don't mix a bug fix with a refactor
- **Include tests** for bug fixes and new features
- **Don't break the build** — `npm test`, `npm run lint`, and `npm run typecheck` must all pass
- **Update documentation** if your change affects the public API
- **No `dist/` changes in PRs** — built artifacts are generated during release

## Reporting bugs

Open a [GitHub Issue](https://github.com/Recallatk/roughcut-videocontext/issues) with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Browser and OS version
- A minimal code example if possible

## Code style

- TypeScript strict mode (`strict: true`, `noImplicitAny: true`)
- ESLint enforces style — run `npm run lint` before committing
- Husky pre-commit hooks run lint, typecheck, and tests automatically

## Code of Conduct

Please follow our [Code of Conduct](#code-of-conduct-1) in all interactions.

---

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, sex characteristics, gender identity and expression,
level of experience, education, socio-economic status, nationality, personal
appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
  advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies within all project spaces, and it also applies when
an individual is representing the project or its community in public spaces.
Examples of representing a project or community include using an official
project e-mail address, posting via an official social media account, or acting
as an appointed representative at an online or offline event. Representation of
a project may be further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at videocontext-conduct@recallatk.com. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at https://www.contributor-covenant.org/version/1/4/code-of-conduct.html

[homepage]: https://www.contributor-covenant.org

For answers to common questions about this code of conduct, see
https://www.contributor-covenant.org/faq

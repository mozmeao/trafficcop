<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

### Contents

- [Building the NPM package](#building-the-npm-package)
- [Running tests](#running-tests)
- [Publishing to NPM](#publishing-to-npm)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

[git-tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[package.json]: https://github.com/mozmeao/trafficcop/blob/master/package.json
[releases]: https://github.com/mozmeao/trafficcop/releases/latest
[readme]: https://github.commozmeao/trafficcop/blob/master/README.md
[changelog]: https://github.com/mozmeao/trafficcop/blob/master/CHANGELOG.md
[webpack]: https://webpack.js.org/
[jasmine-browser-runner]: https://jasmine.github.io/setup/browser.html
[jasmine]: https://jasmine.github.io/

# Building the NPM package

We use a Webpack[webpack] configuration for building the contents of the NPM package ready for publishing. To build the package, run:

```
npm run build
```

This will install dependencies, lint JS files, and then build the package content in the `./dist/` directory.

# Running tests

To perform the package build process above and then run front-end JS tests using Jasmine[jasmine] and Jasmine Browser Runner[jasmine-browser-runner] against the processed files:

```
npm run test
```

# Publishing to NPM

These steps assume you have logged into the NPM CLI and are apart of the @mozmeao organization on NPM

TrafficCop is published to NPM under the `@mozmeao/trafficcop` namespace/package name. To publish a release to NPM, use the following steps:

1. Before you start make sure the project's [CHANGELOG.md][changelog] is up to date.
2. Update the package `version` number in [package.json][package.json] (use [Semantic Versioning][semver] to determine what the new version number should be).
3. Update the package README [README.md][readme].
4. Run `npm install` to update the package-lock.json file.
5. Submit a pull request with your against the `main` branch. Once the changes have been approved and merged to main:
6. Run `npm test` to run the build script and front-end tests. The package contents will be located in `./dist/`.
7. Tag a new release. You can do this either using [Git tag][git-tag], or directly on the [GitHub website][releases]. (Example: `git tag -a v1.1.0`). If you used [Git tag][git-tag], push your tags to the repo using `git push --tags`
8. If the build is successful and all tests pass, publish to NPM using `npm publish ./dist/`.

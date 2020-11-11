opentutor-graphql
==================

Usage
-----

A docker image that serves opentutors's node-based GraphQL api


Running Tests
-------------

```
make test
```

Development
-----------

Required Software
=================
- node 13.2+
- npm
- make


Any changes made to this repo should be covered by tests. To run the existing tests:

```
make test
```

All pushed commits must also pass format and lint checks. To check all required tests before a commit:

```
make test-all
```

To fix formatting issues:

```
make format
```

Releases
--------

Currently, this image is semantically versioned. When making changes that you want to test in another project, create a branch and PR and then you can release a test tag one of two ways:

To build/push a work-in-progress tag of `opentutor-graphql` for the current commit in your branch

- find the `docker_tag_commit` workflow for your commit in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-graphql)
- approve the workflow
- this will create a tag like `https://hub.docker.com/opentutor-graphql:${COMMIT_SHA}`

To build/push a pre-release semver tag of `opentutor-graphql` for the current commit in your branch

- create a [github release](https://github.com/ICTLearningSciences/opentutor-graphql/releases/new) **from your development branch** with tag format `/^\d+\.\d+\.\d+(-[a-z\d\-.]+)?$/` (e.g. `1.0.0-alpha.1`)
- find the `docker_tag_release` workflow for your git tag in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-graphql)
- approve the workflow
- this will create a tag like `uscictdocker/opentutor-graphql:1.0.0-alpha.1`



Once your changes are approved and merged to main, you should create a release tag in semver format as follows:

- create a [github release](https://github.com/ICTLearningSciences/opentutor-graphql/releases/new) **from main** with tag format `/^\d+\.\d+\.\d$/` (e.g. `1.0.0`)
- find the `docker_tag_release` workflow for your git tag in [circleci](https://circleci.com/gh/ICTLearningSciences/workflows/opentutor-graphql)
- approve the workflow
- this will create a tag like `uscictdocker/opentutor-graphql:1.0.0`

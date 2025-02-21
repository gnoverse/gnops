---
title: Setting Up GitHub Actions CI Pipeline for Gno Projects
publishDate: 2025-02-18T08:00:00-01:00
translationKey: "development"
tags: ["gnoland", "gno", "action", "docker", "ci"]
level: Intermediate
author: notJoon
summary: This guide explains how to set up a CI environment for Gno projects using GitHub Actions and Docker.
---

## Overview

This article explains how to set up a CI environment for Gno projects using GitHub Actions and Docker. By following this guide, you can:

- Set up automated testing for your Gno projects
- Create a containerized test environment
- Run tests both locally and in CI pipeline

For a working example, check out this [link](https://github.com/notJoon/lsm-tree).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure Setup](#project-structure-setup)
- [Docker Environment Configuration](#docker-environment-configuration)
- [GitHub Actions Workflow Setup](#github-actions-workflow-setup)
- [Local Test Environment Setup](#local-test-environment-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- **Docker**
- **Some gno project repository**
- **act (optional)**
- **brew (optional)**

## Project Structure Setup

> **IMPORTANT:**
>
> This guide focuses on setting up CI for a single Gno module. If you're working with multiple modules or a more complex project structure, you'll need to modify the configuration accordingly.

Your project should have the following basic structure:

```plaintext
your-gno-project/
├── .github/
│   └── workflows/
│       └── run_test.yml
├── Dockerfile
├── Makefile
└── your-module/
    ├── gno.mod
    ├── *.gno
    └── *_test.gno
```

## Docker Environment Configuration

1. Create a `Dockerfile` in your project root:

```dockerfile
FROM golang:1.22-bullseye

# Install required packages
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Clone and install gno
RUN git clone https://github.com/gnolang/gno.git && \
    cd gno && \
    make install.gno

# Copy the project
COPY . .

# Set default command
CMD ["gno", "test", "./your-module", "-root-dir", "./gno", "-v"]
```

This `Dockerfile`:

- Uses Go 1.22 base image
- Installs necessary build tools
- Installs Gno
- Copies project files
- Sets up test execution command

## GitHub Actions Workflow Setup

1. Create `.github/workflows/<name>.yml` file. In here I set the file name as `run_test`:

```yaml
name: run-test

on:
  pull_request:
    branches:
      - main

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Cache Docker layers
        uses: actions/cache@v3
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-buildx-

      - name: Build and test
        uses: docker/build-push-action@v5
        with:
          context: .
          push: false
          load: true
          tags: gno-test:latest
          cache-from: type=local,src=/tmp/.buildx-cache
          cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max

      - name: Move cache
        run: |
          rm -rf /tmp/.buildx-cache
          mv /tmp/.buildx-cache-new /tmp/.buildx-cache

      - name: Run tests in container
        run: docker run --rm gno-test:latest
```

This workflow:

- Triggers on Pull Requests to the main branch
- Uses Docker image build caching
- Runs tests in container

## Local Test Environment Setup

1. Add the following rule to your `Makefile`:

```makefile
.PHONY: test-docker

test-docker:
  docker build -t gno-test .
  docker run --rm gno-test
```

With this setup, you can run tests locally using:

```bash
make test-docker
```

2. Alternatively, you can use `act`:

[`act`](https://github.com/nektos/act) is a tool that allows you to run GitHub Actions locally. If you haven't installed it yet, you can install it using the `brew` command. Also, when using `act`, Docker must be running.

```bash
act pull_request
```

You might need to specify the architecture if necessary. On MacOS, add the flag like this:

```bash
act pull_request --container-architecture linux/amd64
```

## Troubleshooting

### Common Issues

1. Docker Build Failures
   - Verify Dockerfile base image version
   - Check network connectivity
   - Ensure Docker daemon is running

2. Test Failures
   - Check Gno version compatibility
   - Verify module paths are correct
   - Ensure test files follow the test naming convention (e.g. `*_test.gno`)

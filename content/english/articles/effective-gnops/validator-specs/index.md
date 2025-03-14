---
title: "Machine Specs: Picking the Right Hardware"
publishDate: 2025-03-14T08:00:00-01:00
translationKey: "validator-specs"
tags: [ "sentry", "validator", "nodes", "specs" ]
level: Intermediate
author: zivkovicmilos
summary: This short explainer goes into the machine specifications required for running gno.land nodes, and their equivalents on major cloud platforms.
---

## Overview

When deploying gno.land nodes, it's important to choose hardware tailored specifically to the role each node will
perform in your network. gno.land primarily includes three common node types: **Validators**, **Sentries**, and
**RPC nodes**, each with distinct performance and security requirements.

### A note on storage

All nodes in gno.land function as **archive nodes**. There isn't an efficient pruning mechanism implemented yet.
Keeping this in mind, make sure to have sufficient storage capacity per node, **~512GB+**, regardless of the node type.

## Validator Nodes

Validators are at the core of consensus and should prioritize reliability, security, and consistent performance over
raw throughput. Typically, validator nodes operate behind Sentry nodes and do not require extensive resources
dedicated to handling many external connections and RPC requests. Recommended specifications include:

- Moderate CPU (e.g., 4-8 cores)
- Moderate RAM (e.g., 8-16 GB)
- Fast SSD storage for blockchain data access (IAVL performance)
- Robust networking for stable connections to sentry nodes (Gigabit link)

If the validator node is not behind a Sentry, make sure it has adequate specifications, as in the _Sentry Nodes_ section
below.

**Example Machines:**

- Amazon AWS: `m6a.large` or `c6a.xlarge`
- Google Cloud Platform: `e2-standard-4` or `n2-standard-4`

## Sentry Nodes

[Sentry nodes](https://gnops.io/articles/effective-gnops/sentry-nodes/) function as gateways for validators, designed
explicitly to handle external traffic. Given these nodes are usually public and reachable on the Internet, they require
more resources focused on network throughput, connection handling, and responsiveness:

- Higher CPU (e.g., 8-16 cores) to manage concurrent connections
- High RAM (e.g., 16-32 GB) for efficient request handling
- High-speed SSD storage for quick data retrieval (RPC IAVL querying)
- Superior network bandwidth capacity to withstand heavy request loads and potential DDoS attacks

**Example Machines:**

- Amazon AWS: `c6a.2xlarge` or `m6a.4xlarge`
- Google Cloud Platform: `n2-highmem-8` or `c2-standard-8`

## RPC Nodes

RPC nodes serve as access points for application-level requests and queries from wallets, indexers, and other services.
These nodes need significant resources optimized specifically for read-heavy workloads and concurrent request handling:

- High-performance CPU (e.g., 8-32 cores)
- High RAM capacity (e.g., 32-64 GB or more)
- Extremely fast SSD/NVMe storage for instant data access
- High-bandwidth, low-latency networking (Gigabit link)
- Load balancing across multiple RPC nodes for scalability and high availability

It is worth noting that the RPC machines are going to be generating a lot of network traffic. Make sure the machine
billing plan you choose adequately covers inbound / outbound traffic.

**Example Machines:**

- Amazon AWS: `m6a.8xlarge` or `c6i.8xlarge`
- Google Cloud Platform: `n2-highmem-32` or `c2-standard-16`
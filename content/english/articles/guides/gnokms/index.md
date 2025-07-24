---
title: Secure your Validator Signing Keys using gnokms
publishDate: 2025-07-24T08:00:00-01:00
translationKey: 'gnokms'
tags: ['gnoland', 'validator', 'gnokms', 'security']
level: Intermediate
author: aeddi
summary: This guide explains how to securely manage the keys of a gnoland validator using gnokms.
---

## Overview

In this guide, we delve into `gnokms`, a straightforward Key Management System (KMS) crafted to securely handle signing keys for `gnoland` validator nodes. Instead of storing keys as plaintext on disk, validators can leverage a `gnokms` server running either in a separate process or on a distinct machine. This setup delegates the secure storage and remote signing responsibilities to `gnokms`, enhancing security.

`gnokms` is designed to support multiple backends such as a local `gnokey` instance, a remote Hardware Security Module (HSM), or a cloud-based KMS service. However, as of the time of writing, only the `gnokey` backend is available. If you are interested in the progress of other backends, you can follow the development updates in this dedicated [GitHub issue](https://github.com/gnolang/gno/issues/3230).

For connectivity between the validator and the `gnokms` server, both TCP and Unix domain socket protocols are available. TCP connections are encrypted and can be secured with mutual authentication, utilizing Ed25519 keypairs alongside an authorized keys whitelist on both sides.

### Flowchart

```text
                                                            ┌─────────────────────┐
                                                            │                     │
                                              ┌─────────────┤ Cloud-based backend │
                                              │             │                     │
                                              │             └─────────────────────┘
                                              │
                                              │
                                              │
┌───────────────────┐                 ┌───────┴───────┐     ┌─────────────────────┐
│                   │                 │               │     │                     │
│ gnoland validator │◄─── UDS/TCP ───►│ gnokms server ├─────┤    gnokey backend   │
│                   │                 │               │     │                     │
└───────────────────┘                 └───────┬───────┘     └─────────────────────┘
                                              │
                                              │
                                              │
                                              │             ┌─────────────────────┐
                                              │             │                     │
                                              └─────────────┤     HSM backend     │
                                                            │                     │
                                                            └─────────────────────┘
```

## Prerequisites

- **Git**
- **`make` (for running Makefiles)**
- **Go 1.22+**
- **Go Environment Setup**: Ensure you have Go set up as outlined in
  the [Go official installation documentation](https://go.dev/doc/install) for your environment

## Installation

To install the `gnoland`, `gnokey`, `gnogenesis` and `gnokms` binaries, first clone the Gno monorepo:

```bash
git clone https://github.com/gnolang/gno.git
```

Then go into the `gno` folder and use the Makefiles to install the binaries:

```bash
cd gno
make -C gno.land install.gnoland install.gnokey
make -C contribs/gnogenesis install
make -C contribs/gnokms install
```

If you do not wish to install the binaries globally, you can build them using the `build`
commands instead of the `install` ones:

```bash
cd gno
make -C gno.land build.gnoland build.gnokey
make -C contribs/gnogenesis build
make -C contribs/gnokms build
```

This will create the binaries in their respective `build` directories, from where you can
run them, for example, for `gnoland`:

```bash
./gno.land/build/gnoland -h
```

## Basic `gnoland` validator and `gnokms` server setup

**Note:** Currently, the only supported backend is `gnokey`, so the following instructions will use it.

### 1. Generate a signing key using `gnokey` if you do not already have one

```bash
gnokey add <key-name>
```

You will be prompted to enter a password to encrypt the key. This password will be required later when starting the `gnokms` server.

### 2. Start a `gnokms` server with the `gnokey` backend

Where:

- `<key_name>` is the name of the key generated in step 1.
- <listen_address> is the address on which the server should listen (e.g., `tcp://127.0.0.1:26659` or `unix:///tmp/gnokms.sock`).

```shell
$ gnokms gnokey '<key_name>' -listener '<listen_address>'
2025-07-24T16:22:56.932+0200 INFO  Validator info:
Genesis format:
{
  "address": "g1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "pub_key": {
    "@type": "/tm.PubKeySecp256k1",
    "value": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  },
  "power": "10",
  "name": "gnokms_remote_signer"
}
Bech32 format:
  pub_key: gpub1pgXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  address: g1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

`gnokms` will print the validator information both in bech32 and genesis format (JSON).

### 3. Set the `gnokms` server address in the `gnoland` validator config

Where <gnokms_server_address> is the dial address derived from the <listener_address> in step 2.

```shell
$ gnoland config set consensus.priv_validator.remote_signer.server_address '<gnokms_server_address>'
Updated configuration saved at gnoland-data/config/config.toml
```

### 4. Start the `gnoland` node

```shell
gnoland start
```

You should see logs from both the `gnokms` server and the `gnoland` validator node indicating that the connection is established and the validator is starting to send requests to the `gnokms` server.

## Genesis configuration

If you are testing `gnokms` locally or setting up a new chain, you will need to include the validator information in the genesis file. To do so, you will need the validator info provided by the `gnokms` server in step 2.

We recommend using the `gnogenesis` command to add the bech32 validator information to the genesis file.

```shell
$ gnogenesis validator add \
--address g1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
--pub-key gpub1pgXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX \
--name gnokms_remote_signer \
--power 10 \
--genesis-path <path_to_genesis_file>
```

But if for any reason, you need to manually edit a genesis file to include these info, you can copy and paste the `Genesis format` part of the output.

## Registering as a testnet validator

If you wish to register your validator on a testnet, you can follow the instructions in [this dedicated guide](https://gnops.io/articles/guides/become-testnet-validator/). Just make sure to use the bech32 info provided by the `gnokms` server in step 2 instead of the one provided by the `gnoland secrets get validator_key` command.

## Mutual TCP Authentication

If you use a Unix domain socket (UDS) for the connection between the `gnoland` validator and the `gnokms` server, you do not need to set up mutual authentication, as the UDS is inherently secure and only accessible to processes running on the same machine.

But if you use a TCP connection, we strongly recommend setting up mutual authentication to ensure that both the `gnokms` server and the `gnoland` validator cannot be impersonated.

### 1. Generate a keypair on the `gnokms` server

```shell
$ gnokms auth generate
Generated auth keys file at path: "/home/gnome/.config/gnokms/auth_keys.json"
```

### 2. Get the public key of the `gnokms` server

```
$ gnokms auth identity
Server public key: "<gnokms_public_key>"
```

### 3. Add the `gnokms` server public key to the `gnoland` validator whitelist

```shell
$ gnoland config set consensus.priv_validator.remote_signer.tcp_authorized_keys '<gnokms_public_key>'
Updated configuration saved at gnoland-data/config/config.toml
```

### 4. Get the `gnoland` validator’s public key

```shell
$ gnoland secrets get node_id.pub_key
"<validator_public_key>"
```

### 5. Add the `gnoland` validator public key to the `gnokms` server whitelist

```shell
$ gnokms auth authorized add '<validator_public_key>'
Public key "<validator_public_key>" added to the authorized keys list.
```

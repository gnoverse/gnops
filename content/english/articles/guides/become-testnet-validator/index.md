---
title: "Road to Validation: How to become a testnet validator"
publishDate: 2025-03-14T08:00:00-01:00
translationKey: "bootnodes-persistent-peers"
tags: ["validator", "valopers", "testnet", "onboarding"]
level: Intermediate
author: d4ryl00
summary: "This gives a set of information on onboarding a validator node: how to register as a validator operator (valoper) in the registry and how to submit a validator proposal"
---

# Setting Up a Validator Node in gno.land

## Overview

Validators on **gno.land** are expected to demonstrate their technical expertise and alignment with the project by
making continuous and meaningful contributions. **gno.land** abstracts validator management into the
`r/sys/validators/v3` realm as a form of a smart contract for modularity.

This guide walks you through the process of registering your validator node into the validator set with a
smart-contract. It assumes that you already have an operational validator node running on the testnet, before submitting
a proposal to formally validate the chain. If not, follow [this guide](https://gnops.io/articles/guides/remote-chain/).

## Step 0: Getting GNOT - for testnets

In order to register a valoper profile on a testnet, you need to acquire testnet funds through
the [Faucet Hub](https://faucet.gno.land). Make sure to select the adequate network.

## Step 1: Preparing a Valoper Profile

To be considered to be added to the validator set, you must create a **Valoper** profile and register it in the
`r/gnops/valopers` realm using the `Register` function. This profile allows you to demonstrate to **GovDAO members**
why you should be accepted as a validator.

### Information to include in the `valoper` proposal

Be sure to answer the following questions in the description. This is an example of the details you should provide in
your description:

1. **Validator Name** – The name of your validator.
2. **Networks You Are Currently Validating** – Include your total Assets Under Management (AuM).
3. **Links to Your Digital Presence** – Website, social media, etc. Please include your Discord handle so you can be
   added to our main comms channel, the gno.land valoper Discord channel.
4. **Contact Details** – How others can reach you.
5. **Why You Are Interested in Validating on gno.land** – Your motivation and goals.
6. **Contributions to gno.land** – Past contributions or plans for future contributions.

_Note:_ You can update your `Valoper` profile later using the `Update` helper functions such as `UpdateDescription`.

The instructions might change. Please check the latest information.

## Step 2: Registering Your Valoper Profile

Once your `Valoper` profile is prepared, register it using `gnokey` with the following command:

```sh
gnokey maketx call \
    -pkgpath "gno.land/r/gnops/valopers" \
    -func "Register" \
    -gas-fee 1000000ugnot \
    -gas-wanted 50_000_000 \
    -chainid "test-13" \
    -args "<moniker>" \
    -args "<description>" \
    -args "<server_type>" \
    -args "<operator_address>" \
    -args "<consensus_pub_key>" \
    -remote "https://rpc.test13.testnets.gno.land:443" \
    <key-name>
```

Replace `<moniker>`, `<description>`, `<server_type>`, `<operator_address>`, `<consensus_pub_key>`, and `<key-name>`
with your actual values.

`<server_type>` must be one of:

- `cloud`
- `on-prem`
- `data-center`

The last two arguments are distinct and must not be confused:

- **`<operator_address>`** is your **operator** account address (`g1...`): the stable identity and profile key. It must
  match the address of the `<key-name>` you broadcast with — the realm enforces that the caller equals the operator
  address.
- **`<consensus_pub_key>`** is your validator node's **consensus signing public key** (`gpub1...`). The realm derives the
  signing address from it, so you only supply the public key, not the address.

The `chainid` and `remote` values might change. Please check the latest information.

To fetch your operator address, list your local keys with `gnokey`:

```shell
gnokey list
```

Example output:

```shell
0. test1 (local) - addr: g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5 pub: gpub1pgfj7ard9eg82cjtv4u4xetrwqer2dntxyfzxz3pq0skzdkmzu0r9h6gny6eg8c9dc303xrrudee6z4he4y7cs5rnjwmyf40yaj, path: <nil>
```

The `addr` value (`g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5`) is your `<operator_address>`, and `test1` is the matching
`<key-name>` you broadcast with.

To fetch your validator node's consensus public key, you can run:

```shell
gnoland secrets get validator_key -data-dir gnoland-data
```

with `gnoland-data` being the validator's data dir.

Example output:

```shell
{
    "address": "g16vtw4cgtpxt5tljzc76xr4rcwwmgcqr63qr6yk",
    "pub_key": "gpub1pggj7ard9eg82cjtv4u52epjx56nzwgjyg9zpj3xqx6w4nvy209e28trenv3relp04jt37p0rg2pn4hyy4k0uf2vgexegj"
}
```

Use the `pub_key` value above as `<consensus_pub_key>`. The `address` shown here is the node's signing address — it is
**not** the operator address and should not be used as `<operator_address>`.

## Step 3: Submitting the Proposal

Once your `Valoper` profile is ready, you need to notify GovDAO; only a GovDAO member can submit a proposal to add you
to the validator set. The fastest way is to reach out on [Discord](https://discord.gg/gnoland).

If you are a GovDAO member, you can nominate yourself by calling `maketx run` on the following script:

```go
// proposal.gno
package main

import (
	proposal "gno.land/r/gnops/valopers/proposal"
	"gno.land/r/gov/dao"
)

func main(cur realm) {
	addr := address("...") // <--- the operator address (valoper profile key)

	// Create a proposal to add a new validator to the valset
	pr := proposal.NewValidatorProposalRequest(cross(cur), addr)

	// Create the proposal
	dao.MustCreateProposal(cross(cur), pr)
}
```

Run the command using:

```sh
gnokey maketx run \
  -gas-fee 31000ugnot \
  -gas-wanted 30_000_000 \
  -chainid "test-13" \
  -remote "https://rpc.test13.testnets.gno.land:443" \
  <key-name> \
  ./proposal.gno
```

Replace `<key-name>` with your actual values.

The `chainid` and `remote` values might change. Please check the latest information.

## Step 4: GovDAO Voting

After submitting the proposal, **GovDAO members** will review and vote on your inclusion. If the proposal is approved,
you will officially become a validator in **gno.land**.

If you are a GovDAO member and want to cast a vote from `gnokey`, you can run:

```go
// vote_proposal.gno
package main

import (
	"gno.land/r/gov/dao"
)

func main(cur realm) {
	// Replace 0 with your proposal ID
	dao.VoteOnProposal(cross(cur), dao.NewVoteRequest(dao.YesVote, dao.ProposalID(0)))
}
```

```sh
gnokey maketx run \
  -gas-fee 18000ugnot \
  -gas-wanted 18_000_000 \
  -chainid "test-13" \
  -remote "https://rpc.test13.testnets.gno.land:443" \
  <key-name> \
  ./vote_proposal.gno
```

Replace proposal ID and `<key-name>` with your actual values.

## Conclusion

By following these steps, you can successfully register your validator node and contribute to the decentralization and
security of **gno.land**. Stay active in the community, make meaningful contributions, and properly maintain your node
to uphold network integrity.

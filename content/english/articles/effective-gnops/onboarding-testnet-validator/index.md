---
title: Onboarding a testnet validator
publishDate: 2025-03-14T08:00:00-01:00
translationKey: "bootnodes-persistent-peers"
tags: ["validator", "valopers", "testnet", "onboarding"]
level: Intermediate
author: d4ryl00
summary: "This give a set of information on onboarding a validator node: how to register as a valoper in the registry and how to submit a validator proposal"
---

# Setting Up a Validator Node in gno.land

## Overview

Validators on **gno.land** are expected to demonstrate their technical expertise and alignment with the project by making continuous and meaningful contributions. **gno.land** abstracts validator management into the `r/sys/vals` realm as a form of a smart contract for modularity.

This guide walks you through the process of registering your validator node into the validator set with a smart-contract. It assumes that you already have an operational validator node running on the testnet. If not, follow [this guide](https://gnops.io/articles/guides/remote-chain/).

## Step 1: Creating a `Valoper` object

To be added to the validator set, you must create a **Valoper** object and register it in the `r/gnoland/valopers` realm using the `Register` function. This object allows you to demonstrate to **GovDAO members** why you should be accepted as a validator.

### Information to Include in the `Valoper` object

Be sure to follow the instructions inside the valopers realm. This is an example of the details you should provide in your description:

1. **Validator Name** – Your unique identifier.
2. **Networks You Are Currently Validating** – Include your total Assets Under Management (AuM).
3. **Links to Your Digital Presence** – Website, social media, etc.
4. **Contact Details** – How others can reach you.
5. **Why You Are Interested in Validating on gno.land** – Your motivation and goals.
6. **Contributions to gno.land** – Past contributions or plans for future contributions.

_Note:_ You can update your `Valoper` object later using the `Update` helper functions such as `UpdateDescription`.

## Step 2: Registering Your Validator

Once your `Valoper` object is prepared, register it using `gnokey` with the following command:

```sh
gnokey maketx call \
    -pkgpath "gno.land/r/gnoland/valopers" \
    -func "Register" \
    -gas-fee 1000000ugnot \
    -gas-wanted 30000000 \
    -send "20000000ugnot" \
    -broadcast \
    -chainid "dev" \
    -args "<moniker>" \
    -args "<description>" \
    -args "<validator_address>" \
    -args "<public_key_validator>" \
    -remote "https://rpc.gno.land:443" \
    <key-name>
```

Replace `<moniker>`, `<description>`, `<validator_address>`, `<public_key_validator>`, and `<key-name>` with your actual values.

## Step 3: Submitting the Proposal

Once your `Valoper` object is ready, you, as the validator, can create a proposal to add yourself to the validator set. Use the following command:

```sh
gnokey maketx call \
  -pkgpath "gno.land/r/gnoland/valopers_proposal" \
  -func "ProposeNewValidator" \
  -gas-fee 1000000ugnot \
  -gas-wanted 20000000 \
  -send "100000000ugnot" \
  -broadcast \
  -chainid "dev" \
  -args "<validator_address>" \
  -remote "https://rpc.gno.land:443" \
  <key-name>
```

Replace `<validator_address>` and `<key-name>` with your actual values.

## Step 4: GovDAO Voting

After submitting the proposal, **GovDAO members** will review and vote on your inclusion. If the proposal is approved, you will officially become a validator in **gno.land**.

## Conclusion

By following these steps, you can successfully register your validator node and contribute to the decentralization and security of **gno.land**. Stay active in the community, make meaningful contributions, and properly maintain your node to uphold network integrity.

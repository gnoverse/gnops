---
title: Onboarding a testnet validator
publishDate: 2025-03-11T08:00:00-01:00
translationKey: "bootnodes-persistent-peers"
tags: ["validator", "valopers", "testnet", "onboarding"]
level: Intermediate
author: None
summary: "This give a set of information on onboarding a validator node: how to provision the right server and connect it to the testnet"
---

# Setting Up a Validator Node in gno.land

## Overview

Validators on **gno.land** are expected to demonstrate their technical expertise and alignment with the project by making continuous and meaningful contributions. **gno.land** abstracts validator management into the `r/sys/vals` realm as a form of a smart contract for modularity.

This guide walks you through the process of registering your validator node into the validator set with a smart-contract. It assumes that you already have an operational validator node running on the testnet. If not, follow [this guide](https://docs.gno.land/gno-infrastructure/validators/validators-running-a-validator) (especially the section "Connect to an Existing Gno Chain").

## Step 1: Creating a `Valoper` object

To be added to the validator set, you must create a **Valoper** object and register it in the `r/gnoland/valopers` realm using the `Register` function. This structure allows you to demonstrate to **GovDAO members** why you should be accepted as a validator.

### Information to Include in the `Valoper` Structure

Ensure to follow the instruction inside the valopers realm. This is an example of details you should provide in your description:

1. **Validator Name** – Your unique identifier.
2. **Networks You Are Currently Validating** – Include your total Assets Under Management (AuM).
3. **Links to Your Digital Presence** – Website, social media, etc.
4. **Contact Details** – How others can reach you.
5. **Why You Are Interested in Validating on gno.land** – Your motivation and goals.
6. **Contributions to gno.land** – Past contributions or plans for future contributions.

_Note:_ You can update your `Valoper` structure later using the `Update...` helper functions.

## Step 2: Registering Your Validator

Once your `Valoper` structure is prepared, register it using `gnokey` with the following command:

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

## Step 3: GovDAO Proposal & Voting

After registering, a **GovDAO** member will create a proposal to add you to the validator set. Other members will then vote on your inclusion.

Once the proposal is approved, you will officially become a validator in **gno.land**.

## Conclusion

By following these steps, you can successfully register your validator node and contribute to the decentralization and security of **gno.land**. Stay active in the community, make meaningful contributions, and properly maintain your node to uphold network integrity.

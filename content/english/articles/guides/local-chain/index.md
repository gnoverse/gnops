---
title: Setting up a local Gno chain (from scratch)
publishDate: 2025-01-20T08:00:00-01:00
translationKey: "local-chain"
tags: ["gnoland", "gno", "node", "local"]
level: Intermediate
author: zivkovicmilos
summary: This guide covers how to start a local Gno node (and chain!). Additionally, it goes over the different options you can use to make your Gno instance unique.
---

## Prerequisites

- **Git**
- **`make` (for running Makefiles)**
- **Go 1.22+**
- **Go Environment Setup**: Ensure you have Go set up as outlined in
  the [Go official installation documentation](https://go.dev/doc/install) for your environment

## Installation

To install the `gnoland` and `gnogenesis` binaries, clone the Gno monorepo:

```bash
git clone https://github.com/gnolang/gno.git
```

After cloning the repo, go into the `gno` folder and use the Makefiles
to install the `gnoland` and `gnogenesis` binaries:

```bash
cd gno
make -C gno.land install.gnoland && make -C contribs/gnogenesis install
```

To verify that you've installed the binary properly and that you are able to use
it, run the `gnoland` command:

```bash
gnoland --help
```

If you do not wish to install the binary globally, you can build and run it
with the following command from the `gno.land/` folder:

```bash
cd gno.land
make build.gnoland
```

And finally, run it with `./build gnoland`.

## Starting a local node (lazy init)

You can start a Gno blockchain node with the default configuration by navigating to the `gno.land` sub-folder and
running the following command:

```bash
gnoland start --lazy
```

The command will trigger a chain initialization process (if you haven't run the node before), and start the Gno node,
which is ready to accept transactions and interact with other Gno nodes.

### Lazy init

Starting a Gno blockchain node using just the `gnoland start --lazy` command implies a few things:

- the default configuration will be used, and generated on disk in the `gnoland-data` directory
- random secrets data will be generated (node private keys, networking keys...)
- an entirely new `genesis.json` will be used, and generated on disk in the `../gnoland-data` directory. The genesis
  will have a single validator, whose public key is derived from the previously generated node secrets

To view the command defaults, simply run the `help` command:

```bash
gnoland start --help
```

Let's break down the most important default settings:

- `chainid` - the ID of the Gno chain. This is used for Gno clients, and distinguishing the chain from other Gno
  chains (ex. through IBC)
- `genesis-balances-file` - the initial premine balances file, which contains initial native currency allocations for
  the chain. By default, the genesis balances file is located in `gno.land/genesis/genesis_balances.txt`, this is also
  the
  reason why we need to navigate to the `gno.land` sub-folder to run the command with default settings
- `data-dir` - the working directory for the node configuration and node data (state DB)

### Resetting the chain

As mentioned, the working directory for the node is located in `data-dir`. To reset the chain, you need
to delete this directory and `genesis.json`, then start the node up again. If you are using the default node
configuration, you can run
`make fclean` from the `gno.land` sub-folder to delete the `gnoland-data` working directory.

## Starting a local node (manual configuration)

Manually configuring and starting the Gno blockchain node is a bit more involved than simply initializing it "lazily",
and involves the following steps:

- generating the node secrets, and configuration
- generating the `genesis.json`, and populating it
- starting the node with the generated data

### 1. Generate the node directory (secrets + config)

You can generate the default node directory secrets using the following command:

```shell
gnoland secrets init
```

And generate the default node config using the following command:

```shell
gnoland config init
```

This will initialize the following directory structure:

```shell
.
└── gnoland-data/
    ├── secrets/
    │   ├── priv_validator_state.json
    │   ├── node_key.json
    │   └── priv_validator_key.json
    └── config/
       └── config.toml
```

A couple of things to note:

- `gnoland config init` initializes a default configuration
- `gnoland secrets init` initializes new node secrets (validator key, node p2p key)

Essentially, `gnoland start --lazy` is simply a combination of `gnoland secrets init` and `gnoland config init`,
with the default options enabled.

#### Changing the node configuration

To change the configuration params, such as for example the node's listen address, you can utilize the following
command:

```shell
gnoland config set rpc.laddr tcp://0.0.0.0:26657
```

This will update the RPC listen address to `0.0.0.0:26657`. You can verify the configuration was updated by running:

```bash
gnoland config get rpc.laddr

# similar behavior for cosmos validator
# gaiad tx staking create-validator `--node string (default:tcp://localhost:26657)`
```

#### Monikers

A moniker is a human-readable name of your Gno node. You may customize your moniker with the following
command:

```bash
gnoland config set moniker node01
```

#### Modify existing secrets

We can modify existing secrets, or utilize our own (if we have them backed up, for example) for the gno.land node.
Each secret needs to be placed in the appropriate path within `<data-dir>/secrets`, and it can be replaced or
regenerated with `gnoland secrets init <key-name> --force`

### 2. Generate the `genesis.json`

**Where's the `genesis.json`?**

In this example, we are starting a completely new network. In case you are connecting to an existing network, you don't
need to regenerate the `genesis.json`, but simply fetch it from publicly available resources of the Gno chain you're
trying to connect to.

The `genesis.json` defines the initial genesis state for the chain. It contains information like:

- the current validator set
- any predeployed transactions
- any premined balanced

When the chain starts, the first block will be produced after all the init content inside the `genesis.json` is
executed.

Generating an empty `genesis.json` is relatively straightforward:

```shell
gnogenesis generate
```

The resulting `genesis.json` is empty:

```json
{
  "genesis_time": "2024-05-08T10:25:09Z",
  "chain_id": "dev",
  "consensus_params": {
    "Block": {
      "MaxTxBytes": "1000000",
      "MaxDataBytes": "2000000",
      "MaxBlockBytes": "0",
      "MaxGas": "10000000",
      "TimeIotaMS": "100"
    },
    "Validator": {
      "PubKeyTypeURLs": ["/tm.PubKeyEd25519"]
    }
  },
  "app_hash": null
}
```

This will generate a `genesis.json` in the calling directory, by default. To check all configurable options when
generating the `genesis.json`, you can run the command using the `--help` flag:

```shell
gnogenesis generate --help

USAGE
  generate [flags]

Generates a node's genesis.json based on specified parameters

FLAGS
  -block-max-data-bytes 2000000  the max size of the block data
  -block-max-gas 10000000        the max gas limit for the block
  -block-max-tx-bytes 1000000    the max size of the block transaction
  -block-time-iota 100           the block time iota (in ms)
  -chain-id dev                  the ID of the chain
  -genesis-time 1715163944       the genesis creation time. Defaults to current time
  -output-path ./genesis.json    the output path for the genesis.json
```

## 3. Add the `examples` packages into the `genesis.json` (optional)

This step is not necessarily required, however, using a gno.land chain without the `examples` packages predeployed can
present challenges with users who expect them to be present.

The `examples` directory is located in the `$GNOROOT` location, or the local gno repository clone.

```bash
gnogenesis txs add packages ./examples
```

### 4. Add the initial validator set

A new Gno chain cannot advance without an active validator set.
Since this example follows starting a completely new Gno chain, you need to add at least one validator to the validator
set.

Luckily, we've generated the node secrets in step #1 -- we will utilize the generated node key, so the process we start
locally will be the validator node for the new Gno network.

To display the generated node key data, run the following command:

```shell
gnoland secrets get validator_key
```

This will display the information we need for updating the `genesis.json`, in JSON:

```shell
{
    "address": "g14j4dlsh3jzgmhezzp9v8xp7wxs4mvyskuw5ljl",
    "pub_key": "gpub1pggj7ard9eg82cjtv4u52epjx56nzwgjyg9zqaqle3fdduqul4slg6zllypq9r8gj4wlfucy6qfnzmjcgqv675kxjz8jvk"
}
```

Updating the `genesis.json` is relatively simple, running the following command will add the generated node info to the
validator set:

```shell
gnogenesis validator add \
--address g14j4dlsh3jzgmhezzp9v8xp7wxs4mvyskuw5ljl \
--pub-key gpub1pggj7ard9eg82cjtv4u52epjx56nzwgjyg9zqaqle3fdduqul4slg6zllypq9r8gj4wlfucy6qfnzmjcgqv675kxjz8jvk \
--name Cuttlas
```

We can verify that the new validator was indeed added to the validator set:

```json
{
  "genesis_time": "2024-05-08T10:25:09Z",
  "chain_id": "dev",
  "consensus_params": {
    "Block": {
      "MaxTxBytes": "1000000",
      "MaxDataBytes": "2000000",
      "MaxBlockBytes": "0",
      "MaxGas": "10000000",
      "TimeIotaMS": "100"
    },
    "Validator": {
      "PubKeyTypeURLs": ["/tm.PubKeyEd25519"]
    }
  },
  "validators": [
    {
      "address": "g1lz2ez3ceeds9f6jllwy7u0hvkphuuv0plcc8pp",
      "pub_key": {
        "@type": "/tm.PubKeyEd25519",
        "value": "AvaVf/cH84urHNuS1lo3DYmtEErxkTLRsrcr71QoAr4="
      },
      "power": "1",
      "name": "Cuttlas"
    }
  ],
  "app_hash": null
}
```

### 5. Add the premine list

We then need to add the premine list to the `genesis.json`. The premine list is a list of addresses and their initial balances.
The default premine list is located in `gno.land/genesis/genesis_balances.txt` and we can add it to the `genesis.json` by running:

```shell
gnogenesis balances add -balance-sheet gno.land/genesis/genesis_balances.txt
```
We can verify that the premine list was added to the `genesis.json`:

```json
{
  "genesis_time": "2024-05-08T10:25:09Z",
  "chain_id": "dev",
  "consensus_params": {
    "Block": {
      "MaxTxBytes": "1000000",
      "MaxDataBytes": "2000000",
      "MaxBlockBytes": "0",
      "MaxGas": "10000000",
      "TimeIotaMS": "100"
    },
    "Validator": {
      "PubKeyTypeURLs": ["/tm.PubKeyEd25519"]
    }
  },
  "validators": [
    {
      "address": "g1lz2ez3ceeds9f6jllwy7u0hvkphuuv0plcc8pp",
      "pub_key": {
        "@type": "/tm.PubKeyEd25519",
        "value": "AvaVf/cH84urHNuS1lo3DYmtEErxkTLRsrcr71QoAr4="
      },
      "power": "1",
      "name": "Cuttlas"
    }
  ],
  "app_hash": null,
  "app_state": {
    "@type": "/gno.GenesisState",
    "balances": [
      "g1j80fpcsumfkxypvydvtwtz3j4sdwr8c2u0lr64=10000000000ugnot",
      "g19w2488ntfgpduzqq3sk4j5x387zynwknqdvjqf=10000000000ugnot",
      "g13278z0a5ufeg80ffqxpda9dlp599t7ekregcy6=10000000000ugnot",
      "g15fa8kyjhu88t9dr8zzua8fwdvkngv5n8yqsm0n=10000000000ugnot",
      "g15gdm49ktawvkrl88jadqpucng37yxutucuwaef=10000000000ugnot",
      "g1tue8l73d6rq4vhqdsp2sr3zhuzpure3k2rnwpz=10000000000ugnot",
      "g1n4yvwnv77frq2ccuw27dmtjkd7u4p4jg0pgm7k=10000000000ugnot",
      "g1ndpsnrspdnauckytvkfv8s823t3gmpqmtky8pl=10000000000ugnot",
      "g1mzjajymvmtksdwh3wkrndwj6zls2awl9q83dh6=10000000000ugnot",
      "g1644qje5rx6jsdqfkzmgnfcegx4dxkjh6rwqd69=10000000000ugnot",
      "g1ds24jj9kqjcskd0gzu24r9e4n62ggye230zuv5=10000000000ugnot",
      "g1wwppuzdns5u6c6jqpkzua24zh6ppsus6399cea=10000000000ugnot",
      "g1jg8mtutu9khhfwc4nxmuhcpftf0pajdhfvsqf5=10000000000000ugnot",
      "g1e8umkzumtxgs8399lw0us4rclea3xl5gxy9spp=10000000000ugnot",
      "g1ht236wjd83x96uqwh9rh3fq6pylyn78mtwq9v6=10000000000ugnot",
      "g19wwhkmqlns70604ksp6rkuuu42qhtvyh05lffz=10000000000ugnot",
      "g1k8pjnguyu36pkc8hy0ufzgpzfmj2jl78la7ek3=10000000000ugnot",
      "g1c5shztyaj4gjrc5zlwmh9xhex5w7l4asffs2w6=10000000000ugnot",
      "g1fj9jccm3zjnqspq7lp2g7lj4czyfq0s35600g9=10000000000ugnot",
      "g14hhsss4ngx5kq77je5g0tl4vftg8qp45ceadk3=10000000000ugnot",
      "g1manfred47kzduec920z88wfr64ylksmdcedlf5=10000000000ugnot",
      "g18pmaskasz7mxj6rmgrl3al58xu45a7w0l5nmc0=10000000000ugnot",
      "g1xhccdjcscuhgmt3quww6qdy3j3czqt3urc2eac=10000000000ugnot",
      "g1f977l6wxdh3qu60kzl75vx2wmzswu68l03r8su=10000000000ugnot",
      "g1f4v282mwyhu29afke4vq5r2xzcm6z3ftnugcnv=1000000000000ugnot",
      "g1rrf8s5mrmu00sx04fzfsvc399fklpeg2x0a7mz=10000000000ugnot",
      "g152pn0g5qfgxr7yx8zlwjq48hytkafd8x7egsfv=10000000000ugnot",
      "g1lhpx2ktk0ha3qw42raxq4m24a4c4xqxyrgv54q=10000000000ugnot",
      "g14qekdkj2nmmwea4ufg9n002a3pud23y8k7ugs5=10000000000ugnot",
      "g1cf2ye686ke38vjyqakreprljum4xu6rwf5jskq=10000000000ugnot",
      "g1495y3z7zrej4rendysnw5kaeu4g3d7x7w0734g=10000000000ugnot",
      "g127jydsh6cms3lrtdenydxsckh23a8d6emqcvfa=1000000000000ugnot",
      "g1hygx8ga9qakhkczyrzs9drm8j8tu4qds9y5e3r=10000000000ugnot",
      "g1tjdpptuk9eysq6z38nscqyycr998xjyx3w8jvw=10000000000ugnot",
      "g1us8428u2a5satrlxzagqqa5m6vmuze025anjlj=10000000000000ugnot",
      "g1u7y667z64x2h7vc6fmpcprgey4ck233jaww9zq=10000000000ugnot",
      "g1m6732pkrngu9vrt0g7056lvr9kcqc4mv83xl5q=10000000000ugnot",
      "g13m7f2e6r3lh3ykxupacdt9sem2tlvmaamwjhll=10000000000ugnot",
      "g1wg88rhzlwxjd2z4j5de5v5xq30dcf6rjq3dhsj=10000000000ugnot",
      "g1yqndt8xx92l9h494jfruz2w79swzjes3n4wqjc=10000000000ugnot",
      "g1pfldkplz9puq0v82lu9vqcve9nwrxuq9qe5ttv=10000000000ugnot",
      "g18l9us6trqaljw39j94wzf5ftxmd9qqkvrxghd2=1000000000000ugnot",
      "g19uxluuecjlsqvwmwu8sp6pxaaqfhk972q975xd=10000000000ugnot",
      "g1z629z04f85k4t5gnkk5egpxw9tqxeec435esap=10000000000ugnot",
      "g16ja66d65emkr0zxd2tu7xjvm7utthyhpej0037=10000000000ugnot",
      "g1trkzq75ntamsnw9xnrav2v7gy2lt5g6p29yhdr=10000000000ugnot",
      "g1qpymzwx4l4cy6cerdyajp9ksvjsf20rk5y9rtt=10000000000ugnot",
      "g1q6jrp203fq0239pv38sdq3y3urvd6vt5azacpv=1000000000000ugnot",
      "g13d7jc32adhc39erm5me38w5v7ej7lpvlnqjk73=1000000000000ugnot",
      "g19t3n89slfemgd3mwuat4lajwcp0yxrkadgeg7a=10000000000ugnot",
      "g1589c8cekvmjfmy0qrd4f3z52r7fn7rgk02667s=10000000000ugnot",
      "g1768hvkh7anhd40ch4h7jdh6j3mpcs7hrat4gl0=10000000000ugnot",
      "g1026p54q0j902059sm2zsv37krf0ghcl7gmhyv7=10000000000ugnot",
      "g19p5ntfvpt4lwq4jqsmnxsnelhf3tff9scy3w8w=10000000000ugnot",
      "g187982000zsc493znqt828s90cmp6hcp2erhu6m=10000000000ugnot",
      "g13sm84nuqed3fuank8huh7x9mupgw22uft3lcl8=10000000000ugnot",
      "g14da4n9hcynyzz83q607uu8keuh9hwlv42ra6fa=10000000000ugnot"
    ],
    "txs": null,
    "params": null,
    "auth": {
      "params": {
        "max_memo_bytes": "0",
        "tx_sig_limit": "0",
        "tx_size_cost_per_byte": "0",
        "sig_verify_cost_ed25519": "0",
        "sig_verify_cost_secp256k1": "0",
        "gas_price_change_compressor": "0",
        "target_gas_ratio": "0",
        "initial_gasprice": {
          "gas": "0",
          "price": ""
        }
      }
    }
  }
}
```

### 6. Starting the chain

We have completed the main aspects of setting up a node:

- generated the node directory (secrets and configuration) ✅
- set the adequate configuration params ✅
- generated a `genesis.json` ✅
- added an initial validator set to the `genesis.json` ✅

Now, we can go ahead and start the Gno chain for the first time, by running:

```shell
gnoland start \
--genesis ./genesis.json \
--data-dir ./gnoland-data
```

That's it! 🎉

Your new Gno node (chain) should be up and running.

## Chain runtime options

### Changing the chain ID

Below are some implications to consider when changing the chain ID:

- it affects how the Gno node communicates with other Gno nodes / chains
- Gno clients that communicate through JSON-RPC need to match this value

It's important to configure your node properly before launching it in a distributed network.
Keep in mind that changes may not be applicable once connected.

To change the Gno chain ID, run the following command:

```bash
gnoland start --chainid NewChainID
```

We can verify the chain ID has been changed, by fetching the status of the node and seeing the
associated chain ID. By default, the node exposes the JSON-RPC API on `http://127.0.0.1:26657`:

```bash
curl -H "Content-type: application/json" -d '{
    "jsonrpc": "2.0",
    "method": "status",
    "params": [],
    "id": 1
}' 'http://127.0.0.1:26657'
```

We should get a response similar to this:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "node_info": {
      "version_set": [
        // ...
      ],
      "net_address": "g10g9r37g9xa54a6clttzmhk2gmdkzsntzty0cvr@0.0.0.0:26656",
      "network": "NewChainID"
      // ...
    }
  }
}
```

**Chain ID can be set only once**

Since the chain ID information is something bound to a chain, you can
only change it once upon chain initialization, and further attempts to change it will
have no effect.

### Changing the node configuration

You can specify a node configuration file using the `--config` flag.

```bash
gnoland start --config config.toml
```

### Changing the premine list

You do not need to use the `gno.land/genesis/genesis_balances.txt` file as the source of truth for initial network
funds.

To specify a custom balance sheet for a fresh local chain, you can use the `-genesis-balances-file`:

```bash
gnoland start -genesis-balances-file custom-balances.txt
```

Make sure the balances file follows the following format:

```text
<address>=<balance>ugnot
```

Following this pattern, potential entries into the genesis balances file would look like:

```text
g1qpymzwx4l4cy6cerdyajp9ksvjsf20rk5y9rtt=10000000000ugnot
g1u7y667z64x2h7vc6fmpcprgey4ck233jaww9zq=10000000000ugnot
```

**Genesis generation**

Genesis block generation happens only once during the lifetime of a Gno chain.
This means that if you specify a balances file using `gnoland start`, and the chain has already started (advanced from
block 0), the specified balance sheet will not be applied.

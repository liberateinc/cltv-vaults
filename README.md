cltv-vaults
------------

Javascript library to create and spend from CLTV vaults.

### SimpleVault

A Simple Vault is a plain CLTV vault that checks the locktime and then does a
p2pk validation. This is optimized for transaction size and is useful for
vaults that are private and do not need the Vault Script to be shared with
anyone.

**p2sh script template:**
```
<height> OP_CHECKLOCKTIMEVERIFY OP_DROP <pubkey> OP_CHECKSIG
```

**scriptSig template:**
```
<signature> <p2sh script>
```

This script protocol is used by, for example,
[coinb.in](https://coinb.in/#newTimeLocked).

### HashVault

A Hash Vault is a CLTV vault that checks locktime and then turns into a p2pkh
transaction. This is useful when the Vault Script needs to be shared to proof
that the funds are really locked, as this does not expose the public key.
Transactions that redeem from a HashVault are larger than those that redeem a
SimpleVault because the full public key needs to be included on the scriptSig
stack.

This script protocol was originally proposed by Peter Todd in the
[BIP-65 spec](https://github.com/bitcoin/bips/blob/master/bip-0065.mediawiki#freezing-funds).

**p2sh script template:**
```
<height> OP_CHECKLOCKTIMEVERIFY OP_DROP OP_DUP OP_HASH160 <pubkeyhash> OP_EQUALVERIFY OP_CHECKSIG
```

**scriptSig template:**
```
<signature> <pubkey> <p2sh script>
```

### VaultTransactionFactory

Generates transactions to empty a vault after expiry, based on the Vault Script
provided. Callers are expected to bring their own utxos.

Note that for all vault types, it is recommended to empty these completely after
the timelock expires.

### Usage
See the `examples` directory.

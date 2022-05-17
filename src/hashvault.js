'use strict'
const { script, crypto } = require('bitcoinjs-lib')
const SimpleVault = require('./simple')

/** Assembly template of the redeemscript used for vaults. */
const SCRIPT_TEMPLATE = [
  undefined, // to be replaced with a block height
  script.OPS.OP_CHECKLOCKTIMEVERIFY, // verify the locktime (BIP-65)
  script.OPS.OP_DROP, // drop the locktime off the stack if matched
  script.OPS.OP_DUP, // clone the pubkey on the stack
  script.OPS.OP_HASH160, // hash the clone in place
  undefined, // to be replaced with a pubkeyhash
  script.OPS.OP_EQUALVERIFY, // check that the hashes match & pop the stack
  script.OPS.OP_CHECKSIG // check signature
]

/** A class constructing a p2pkh Vault script from a public key and block height. */
class HashVault extends SimpleVault {
  /**
   * Generate the script stack.
   * @returns {Array} Array with opcodes and data elements.
   */
  toStack () {
    const out = SCRIPT_TEMPLATE.map(i => i)
    out[0] = this.height.sizeOptimized().reverse()
    out[5] = crypto.hash160(this.pubKey)
    return out
  }

  /**
   * Serialize the sigScript.
   * @mustoverride
   * @returns {Buffer} The entire sigscript
   */
  serializeSigScript (sig) {
    return script.compile([sig, this.pubKey, this.compile()])
  }
}

module.exports = HashVault

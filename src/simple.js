'use strict'
const { script } = require('bitcoinjs-lib')
const UInt39 = require('uint39')
const AbstractVault = require('./abstract')

/** Assembly template of the redeemscript used for simple vaults. */
const SCRIPT_TEMPLATE = [
  undefined, // to be replaced with a block height
  script.OPS.OP_CHECKLOCKTIMEVERIFY, // verify the locktime (BIP-65)
  script.OPS.OP_DROP, // drop the locktime off the stack if matched
  undefined, // to be replaced with a pubkey
  script.OPS.OP_CHECKSIG // check signature
]

/** A class constructing a simple p2pk Vault script from a public key and block height. */
class SimpleVault extends AbstractVault {
  /**
   * Create a SimpleVault.
   * @param pubKey {Buffer} - Buffer containing a public key.
   * @param height {number} - The height until which to lock funds
   */
  constructor (pubKey, height) {
    super()

    if (!Buffer.isBuffer(pubKey)) {
      throw new Error('SimpleVault: argument 0 (pubKey) must be a buffer')
    }

    if (['number', 'bigint'].indexOf(typeof height) === -1) {
      throw new Error('SimpleVault: argument 1 (height) must be a number or bigint')
    }

    this.pubKey = pubKey
    this.height = UInt39.fromNumber(height)
  }

  /**
   * Generate the script stack.
   * @returns {Array} Array with opcodes and data elements.
   */
  toStack () {
    const out = SCRIPT_TEMPLATE.map(i => i)
    out[0] = this.height.sizeOptimized().reverse()
    out[3] = this.pubKey
    return out
  }

  /**
   * Serialize the sigScript.
   * @mustoverride
   * @returns {Buffer} The entire sigscript
   */
  serializeSigScript (sig) {
    return script.compile([sig, this.compile()])
  }
}

module.exports = SimpleVault

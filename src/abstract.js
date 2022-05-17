'use strict'
const { script, crypto, payments, networks } = require('bitcoinjs-lib')

/** An abstract class for creating Vaults. */
class AbstractVault {
  /**
   * STUB: Generate the script stack.
   * @mustoverride
   * @returns {Array} Array with opcodes and data elements.
   */
  toStack () {
    throw new Error('not implemented')
  }

  /**
   * STUB: Serialize the sigScript.
   * @mustoverride
   * @returns {Buffer} The entire sigscript.
   */
  serializeSigScript (sig) {
    throw new Error('not implemented')
  }

  /**
   * Compile the script into a Buffer.
   * @returns {Buffer} Compiled script as a buffer.
   */
  compile () {
    return script.compile(this.toStack())
  }

  /**
   * Compile the script into a Hex string.
   * @returns {string} Compiled script as a hexadecimal encoded string.
   */
  toHex () {
    return this.compile().toString('hex')
  }

  /**
   * Hash the compiled script for p2sh creation using ripemd160.
   * @returns {Buffer} Buffer containing ripemd160 hash of the compiled script.
   */
  toScriptHash () {
    return crypto.hash160(this.compile())
  }

  /**
   * Compile the script into a p2sh output script.
   * @returns {Buffer} Compiled p2sh output script for the Vault.
   */
  toOutputScript () {
    return script.compile([script.OPS.OP_HASH160, this.toScriptHash(), script.OPS.OP_EQUAL])
  }

  /**
   * Compile the script into a p2sh address
   * @param network {Object} - (optional) A bitcoinjs network descriptor,
   *                                      default: Bitcoin Mainnet.
   * @see https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/networks.d.ts
   * @returns {string} P2SH address for the Vault.
   */
  toAddress (network) {
    const selectedNetwork = network || networks.bitcoin
    return payments.p2sh({ hash: this.toScriptHash(), network: selectedNetwork }).address
  }
}

module.exports = AbstractVault

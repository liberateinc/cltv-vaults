'use strict'
const AbstractVault = require('./abstract')
const { Transaction, script } = require('bitcoinjs-lib')

/** Factory class to create transactions that spend from a Vault. */
class VaultTransactionFactory {
  /**
   * Create a new VaultTransactionFactory.
   * @param vault {AbstractVault} - The Vault Script we're transacting from.
   */
  constructor (vault) {
    if (!(vault instanceof AbstractVault)) {
      throw new Error('VaultTransactionFactory: argument 0 (vault) must be a Vault')
    }

    this.vault = vault
    this.tx = new Transaction()

    // NOTE: here, using number is ok because the native field is an uint32
    this.tx.locktime = vault.height.toNumber()
  }

  /**
   * Add an input to the transaction.
   * @param hash {Buffer} - The hash of the transaction we're spending from.
   * @param idx {number} - The vout index of the transaction we're spending from.
   * @param _sequence {number} - (optional) sequence number for this input,
                                            for RBF. Must be <= 0xfffffffe.
   * @returns {VaultTransactionFactory}
   */
  addInput (hash, idx, _sequence) {
    const sequence = _sequence || 0xfffffffe
    if (sequence > 0xfffffffe) {
      throw new Error('Cannot opt-out of CLTV for Vault transactions')
    }

    this.tx.addInput(hash.reverse(), idx, sequence)

    return this
  }

  /**
   * Add an output to the transaction.
   * @param script {Buffer} - compiled outscript.
   * @param value {number} - amount to send.
   * @returns {VaultTransactionFactory}
   */
  addOutput (script, value) {
    this.tx.addOutput(script, value)

    return this
  }

  /**
   * Sign all inputs with an ECKey.
   * @param key {ECKey} - Elliptic curve key from bitcoinjs/eckey.
   * @param sighashType {number} - (optional) SIGHASH type, default: SIGHASH_ALL.
   * @returns {VaultTransactionFactory}
   */
  sign (key, sighashType) {
    const sighash = sighashType || Transaction.SIGHASH_ALL
    const compiledVaultScript = this.vault.compile()

    this.tx.ins.forEach((_, idx) => {
      const hash = this.tx.hashForSignature(idx, compiledVaultScript, sighash)
      const sig = script.signature.encode(key.sign(hash), sighash)
      this.tx.setInputScript(idx, this.vault.serializeSigScript(sig))
    })

    return this
  }

  /**
   * Serialize the transaction into a buffer.
   * @returns {Buffer}
   */
  toBuffer () {
    return this.tx.toBuffer()
  }

  /**
   * Serialize the transaction into a hex string.
   * @returns {string}
   */
  toHex () {
    return this.toBuffer().toString('hex')
  }
}

module.exports = VaultTransactionFactory

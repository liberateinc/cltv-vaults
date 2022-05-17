// ----- CHANGE THIS VALUE ----- //
const UNLOCK_AT = BigInt(31338) // change to a lock height in the future
// ----------------------------- //

const { SimpleVault } = require('../src')
const { networks } = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const tinysecp = require('tiny-secp256k1')

// instantiate an ECPair class with tiny-secp256k1
const ECPair = ECPairFactory(tinysecp)

// generate a random key (for Bitcoin Testnet)
const network = networks.testnet
const randomKey = ECPair.makeRandom({ network })

// generate a vault
const vaultScript = new SimpleVault(randomKey.publicKey, UNLOCK_AT)

// print all the info
console.log('WIF:          ', randomKey.toWIF())
console.log('Public Key:   ', randomKey.privateKey.toString('hex'))
console.log('Vault height: ', UNLOCK_AT)
console.log('Vault script: ', vaultScript.toHex())
console.log('Vault address:', vaultScript.toAddress(network))

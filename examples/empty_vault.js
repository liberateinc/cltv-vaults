// ----- CHANGE THESE VALUES ----- //
const UNLOCK_AT = BigInt(31338) // replace with block height from create_vault
const MY_WIF = '' // replace with WIF from create_vault
const MY_TX = '' // replace with the tx hash from your funding transaction
const MY_TX_VOUT = 0 // replace with the vout index of your funding transaction
const MY_AMOUNT = 0 // replace with the value you have in your funding transaction
const MY_DESTINATION = Buffer.from('6a', 'hex') // replace the script with a valid destination
// ------------------------------- //

const { SimpleVault, VaultTransactionFactory } = require('../src')
const { networks } = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const tinysecp = require('tiny-secp256k1')

// instantiate an ECPair class with tiny-secp256k1
const ECPair = ECPairFactory(tinysecp)

// import the private key
const network = networks.testnet
const notRandomKey = ECPair.fromWIF(MY_WIF, network)

// generate the vault again
const vaultScript = new SimpleVault(notRandomKey.publicKey, UNLOCK_AT)

// create a transaction factory
const tf = new VaultTransactionFactory(vaultScript)

// create the transaction
tf.addInput(Buffer.from(MY_TX, 'hex'), MY_TX_VOUT).addOutput(MY_DESTINATION, MY_AMOUNT).sign(notRandomKey)

// serialize the transaction as hexadecimal string
console.log(tf.toHex())

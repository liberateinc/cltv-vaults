const tape = require('tape')
const { SimpleVault, VaultTransactionFactory } = require('../../src')
const { networks } = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const tinysecp = require('tiny-secp256k1')

const ECPair = ECPairFactory(tinysecp)

const fixtures = {
  wif: 'cRJ6PbqYEMfo4fM4nfYBk3rgehqady6kxhvxcj373bfF1Y7g1cci',
  pub: '0350a54077c8e7b2e9bd70ef80310cf9ee85a20fae8bf7cff27f6743f55dc03c5a',
  height: BigInt(3822500),
  heightCLTV: 'a4533a',
  vault: '03a4533ab175210350a54077c8e7b2e9bd70ef80310cf9ee85a20fae8bf7cff27f6743f55dc03c5aac',
  address: '2NCu4SVozWuw9qwVbLh8Qbv1jtrNifEkeYG',
  hashIn: '4ff1b67f7d6eabbde1848d75bf661c6bb755ccde533612f7e0e88c412b010b4b',
  vout: 1,
  destination: '76a914bd7a009e5dc03c785c0df2a8535ff625ad44778c88ac',
  amount: 499900000000,
  tx: '01000000014b0b012b418ce8e0f7123653decc55b76b1c66bf758d84e1bdab6e7d7fb6f14f010000007348304502210099c2177faac8f8d406d21995c1ed8917be072a95edd5f9ba88dac34a797866f6022034b3eef6a23679bfdef1cd328ea479c7ad5ffec317d27e6147c6d93695dca3c3012903a4533ab175210350a54077c8e7b2e9bd70ef80310cf9ee85a20fae8bf7cff27f6743f55dc03c5aacfeffffff0100a75c64740000001976a914bd7a009e5dc03c785c0df2a8535ff625ad44778c88aca4533a00'
}

tape('SimpleVault', t => {
  t.plan(5)

  const k = ECPair.fromWIF(fixtures.wif, networks.testnet)
  const v = new SimpleVault(k.publicKey, fixtures.height)

  const stack = v.toStack()
  t.equal(stack[0].toString('hex'), fixtures.heightCLTV, 'must encode height correctly')
  t.equal(stack[3].toString('hex'), fixtures.pub, 'must provide the correct pubkey')
  t.equal(v.toHex(), fixtures.vault, 'must provide the exact vault script')
  t.equal(v.toAddress(networks.testnet), fixtures.address, 'must provide the exact vault address')

  const tf = new VaultTransactionFactory(v)
  tf.addInput(Buffer.from(fixtures.hashIn, 'hex'), fixtures.vout)
  tf.addOutput(Buffer.from(fixtures.destination, 'hex'), fixtures.amount)
  tf.sign(k)

  t.equal(tf.toHex(), fixtures.tx, 'must generate the exact redemption tx')
})

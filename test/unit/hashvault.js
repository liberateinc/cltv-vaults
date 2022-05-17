const tape = require('tape')
const { HashVault, VaultTransactionFactory } = require('../../src')
const { networks } = require('bitcoinjs-lib')
const { ECPairFactory } = require('ecpair')
const tinysecp = require('tiny-secp256k1')

const ECPair = ECPairFactory(tinysecp)

const fixtures = {
  wif: 'cRJ6PbqYEMfo4fM4nfYBk3rgehqady6kxhvxcj373bfF1Y7g1cci',
  hash160: '657a434b2907b513313a5ec4f1cbd9d2a1e13fd9',
  height: 3822500,
  heightCLTV: 'a4533a',
  vault: '03a4533ab17576a914657a434b2907b513313a5ec4f1cbd9d2a1e13fd988ac',
  address: '2N4dLadeFZkA8R9RDQntsuoofXgXNkLyasf',
  hashIn: '41b23c7603ce5caf58b67cbd33374fcb83c12a74cd7d4cd59248ba112df3d348',
  vout: 0,
  destination: '76a914bd7a009e5dc03c785c0df2a8535ff625ad44778c88ac',
  amount: 499900000000,
  tx: '010000000148d3f32d11ba4892d54c7dcd742ac183cb4f3733bd7cb658af5cce03763cb241000000008a473044022056e14b0cd98cc4b234877b5b19173f2bb6eb255a9a6a8315828f694c9795f048022048c2ed79558142f2662a1d7bb8557776bb2aae895256a17384bdb955fe01028c01210350a54077c8e7b2e9bd70ef80310cf9ee85a20fae8bf7cff27f6743f55dc03c5a1f03a4533ab17576a914657a434b2907b513313a5ec4f1cbd9d2a1e13fd988acfeffffff0100a75c64740000001976a914bd7a009e5dc03c785c0df2a8535ff625ad44778c88aca4533a00'
}

tape('HashVault', t => {
  t.plan(5)

  const k = ECPair.fromWIF(fixtures.wif, networks.testnet)
  const v = new HashVault(k.publicKey, fixtures.height)

  const stack = v.toStack()
  t.equal(stack[0].toString('hex'), fixtures.heightCLTV, 'must encode height correctly')
  t.equal(stack[5].toString('hex'), fixtures.hash160, 'must provide the correct pkh')
  t.equal(v.toHex(), fixtures.vault, 'must provide the exact vault script')
  t.equal(v.toAddress(networks.testnet), fixtures.address, 'must provide the exact vault address')

  const tf = new VaultTransactionFactory(v)
  tf.addInput(Buffer.from(fixtures.hashIn, 'hex'), fixtures.vout)
  tf.addOutput(Buffer.from(fixtures.destination, 'hex'), fixtures.amount)
  tf.sign(k)

  t.equal(tf.toHex(), fixtures.tx, 'must generate the exact redemption tx')
})

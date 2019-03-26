'use strict'

const bip39 = require('bip39')
const hdkey = require('hdkey')

/**
 * Derive a private key from a given mnemonic.
 *
 * @param {string} mnemonic The 12-word (BIP39) mnemonic.
 * @param {string} derivationPath The key derivation path.
 * @param {string} [password] The password for the mnemonic.
 * @returns {string} The private key string prefixed with `0x`.
 */
function mnemonicToPrivateKey (mnemonic, derivationPath, password) {
  const seed = bip39.mnemonicToSeed(mnemonic, password)
  const node = hdkey.fromMasterSeed(seed).derive(derivationPath)
  return node.privateKey.toString('hex')
}

module.exports = {
  toPrivateKey: mnemonicToPrivateKey,
  validate: bip39.validateMnemonic
}

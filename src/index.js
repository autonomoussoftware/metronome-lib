'use strict'

const debug = require('debug')('met')
const metOps = require('metronome-ops')
const MetronomeContracts = require('metronome-contracts')

const mnemonic = require('./mnemonic')
const parseContractLogs = require('./parse-logs')

/**
 * A Metronome contracts set.
 *
 * @typedef {Object} MetronomeContractsInstance
 * @property {Object} Auctions The Web3 contract instance.
 * @property {Object} AutonomousConverter The Web3 contract instance.
 * @property {Object} METToken The Web3 contract instance.
 * @property {Object} TokenPorter The Web3 contract instance.
 */

/**
 * Create a Metronome object ready to work with the Metronome contracts.
 *
 * The proper contracts-set will be selected based on which chain the web3
 * instance is connected to.
 *
 * @constructs Metronome
 * @param {Object} web3 A Web3 instance.
 */
function Metronome (web3) {
  this.web3 = web3

  this.contractsPromise = web3.eth.net.getId()
    .then(function (id) {
      debug('Creating contracts for chain ID %d', id)
      return new MetronomeContracts(web3, id)
    })
}

/**
 * Get the Metronome contracts of the library instance.
 *
 * @returns {Promise<MetronomeContractsInstance>}
 */
Metronome.prototype.getContracts = function () {
  return this.contractsPromise
}

/**
 * Get the Metronome chain name.
 *
 * @returns {Promise<string>} The name i.e. `'ETH'`.
 */
Metronome.prototype.getMetChainName = function () {
  return this.getContracts()
    .then(metOps.getMetChainName)
}

/**
 * An object representing the auction status.
 *
 * @typedef {Object<string, any>} AuctionStatus
 * @property {string} currAuction The auction number.
 * @property {string} currentAuctionPrice The MET price.
 * @property {number} dailyAuctionStartTime The daily auctions start time (ms).
 * @property {number} genesisTime The ISA start time (ms).
 * @property {string} lastPurchasePrice The last purchase price.
 * @property {number} lastPurchaseTime The last purchase time (ms).
 * @property {string} minting The coins available in the current auction.
 * @property {number} nextAuctionTime The next auction start time (ms).
 */

/**
 * Get the status of the Auctions contract.
 *
 * @returns {Promise<AuctionStatus>} The status.
 */
Metronome.prototype.getAuctionStatus = function () {
  return this.getContracts()
    .then(metOps.getAuctionStatus)
}

/**
 * An object representing the autonomous converter status.
 *
 * The converter price returned is for informational purposes only as the
 * conversion price will change depending on the amount sent and the contract's
 * balance.
 *
 * @typedef {Object} AutonomousConverterStatus
 * @property {string} currentConverterPrice The coins returned for 1 MET.
 * @property {string} ethBalance The contract's coins balance. I.e. ETH.
 * @property {string} metBalance The contract's MET balance.
 */

/**
 * Get the status of the AutonomousConverter contract.
 *
 * @returns {Promise<AutonomousConverterStatus>} The status.
 */
Metronome.prototype.getConverterStatus = function () {
  return this.getContracts()
    .then(metOps.getConverterStatus)
}

/**
 * A combined status.
 *
 * @typedef {Object} AuctionAndConverterStatus
 * @property {AuctionStatus} auction
 * @property {AutonomousConverterStatus} converter
 */

/**
 * Get the status of both the Auctions and AutonomousConverter contracts.
 *
 * @returns {Promise<AuctionAndConverterStatus>} The statuses.
 */
Metronome.prototype.getStatus = function () {
  return Promise.all([this.getAuctionStatus(), this.getConverterStatus()])
    .then(([auction, converter]) => ({ auction, converter }))
}

/**
 * Get the MET balance of an account.
 *
 * @param {string} [owner] The address of the account. Defaults to the set account.
 * @returns {Promise<string>} The MET balance.
 */
Metronome.prototype.getMetBalance = function (owner) {
  const address = owner || this.address
  return this.getContracts()
    .then(contracts => metOps.getMetBalance(contracts, address))
}

/**
 * Calculate the coin to MET return conversion.
 *
 * @param {string} depositAmount The coin amount to convert.
 * @returns {Promise<string>} The MET amount that would be returned.
 */
Metronome.prototype.getCoinsToMetResult = function (depositAmount) {
  return this.getContracts()
    .then(contracts => metOps.getCoinsToMetResult(contracts, depositAmount))
}

/**
 * Calculate the MET to coin return conversion.
 *
 * @param {string} depositAmount The MET amount to convert.
 * @returns {Promise<string>} The coin amount that would be returned.
 */
Metronome.prototype.getMetToCoinsResult = function (depositAmount) {
  return this.getContracts()
    .then(contracts => metOps.getMetToCoinsResult(contracts, depositAmount))
}

/**
 * An object having destination contracts data.
 *
 * @typedef {Object} DestinationChainData
 * @property {string} destChain The Metronome chain name.
 * @property {string} destMetronomeAddr The METToken contract address.
 */

/**
 * Get the destination chain data to perform an export.
 *
 * @returns {Promise<DestinationChainData>} The chain data.
 */
Metronome.prototype.getDestinationChainData = function () {
  return this.getContracts()
    .then(metOps.getDestinationChainData)
}

/**
 * An object having destination contracts data.
 *
 * @typedef {Object} OriginChainData
 * @property {number} dailyAuctionStartTime The METToken contract address.
 * @property {number} genesisTime The METToken contract address.
 * @property {string} originChain The Metronome chain name.
 */

/**
 * Get the destination chain data to perform an export.
 *
 * @returns {Promise<OriginChainData>} The chain data.
 */
Metronome.prototype.getOriginChainData = function () {
  return this.getContracts()
    .then(metOps.getOriginChainData)
}

/**
 * Get the Merkle root of a last 16 burns.
 *
 * @param {Object} exportData The returned export data.
 * @param {string} exportData.burnSequence The burn sequence number.
 * @returns {Promise<string>} The Merkle root hash.
 */
Metronome.prototype.getExportProof = function ({ burnSequence }) {
  return this.getContracts()
    .then(contracts => metOps.getExportProof(contracts, burnSequence))
}

/**
 * Set the default account for this library instance.
 *
 * All transactions will be signed and sent using the default account.
 *
 * @param {string} privKeyOrMnemonic Either an `0x` prefixed hex private key or a 12-word mnemonic.
 * @param {Object} options
 * @param {string} [options.derivationPath] The key derivarion path to derive the keys from the mnemonic. Defaults to `m/44'/60'/0'/0/0`.
 * @param {string} [options.password] The mnemonic password.
 * @returns {Metronome} The library instance.
 */
Metronome.prototype.setAccount = function (privKeyOrMnemonic, options = {}) {
  const {
    derivationPath = "m/44'/60'/0'/0/0",
    password
  } = options
  const { web3 } = this

  const privateKey = mnemonic.validate(privKeyOrMnemonic)
    ? `0x${mnemonic.toPrivateKey(privKeyOrMnemonic, derivationPath, password)}`
    : privKeyOrMnemonic

  const { address } = web3.eth.accounts.wallet.create(0).add(privateKey)
  this.address = address
  debug('Account %s set', address)

  return this
}

/**
 * Unwrap the `PromiEvent` returned by any send transaction operation.
 *
 * This operation is needed to continue the promise chain after sending a
 * transaction as the library wraps the `PromiEvent` objects to allow setting
 * listeners to transaction processing events.
 *
 * @param {Object} wrapper The wrapper object.
 * @param {Object} wrapper.promiEvent The `PromiEvent` to unwrap.
 * @returns {Object} The unwrapped `PromiEvent`.
 */
const unwrapPromiEvent = ({ promiEvent }) => promiEvent

/**
 * Get the transaction success status.
 *
 * In chains that do not return the `status` field set in the receipt, success
 * status is derived from the exstance of event logs. For this library, that is
 * enough as all relevant transactions will result in events to be logged.
 *
 * @param {Object} receipt The transaction receipt.
 * @returns {boolean} The execution success status.
 */
const getReceiptStatus = receipt =>
  typeof receipt.status === 'boolean'
    ? receipt.status
    : (
      (receipt.logs && !!receipt.logs.length) ||
      (receipt.events && !!Object.keys(receipt.events).length)
    )

/**
 * Check if the transaction was successful. Throw otherwise.
 *
 * @param {Object} receipt The transaction receipt.
 * @returns {Object} The same receipt if the status was success.
 * @throws If the transaction failed.
 */
function checkReceiptStatus (receipt) {
  if (!getReceiptStatus(receipt)) {
    debug('Transaction failed %j', receipt)
    throw new Error(`Transaction failed ${receipt.transactionHash}`)
  }
  return receipt
}

/**
 * Create a function to parse event logs coming from the given contract.
 *
 * When an event is logged by a contract other than the one called, web3 cannot
 * parse the logs as that contract's ABI is not know in advance. Therefore
 * additional parsing is needed and can be done providing the contract that
 * should have logged events.
 *
 * @param {Object} contract The web3 contract instance.
 * @returns {function(Object):Object} The function that will reparse the transaction receipts.
 */
const parseReceiptLogs = contract =>
  receipt =>
    parseContractLogs(contract, receipt)

/**
 * Find the event name in the receipt logs and format the output.
 *
 * @param {string} eventName The name of the event.
 * @returns {Object} An object containing the transaction hash and event data.
 * @throws If the event is not found.
 */
const findEventLog = eventName =>
  function ({ events, transactionHash }) {
    const event = events[eventName]
    if (!event) {
      throw new Error(`Missing event ${eventName} in ${transactionHash}`)
    }
    return { transactionHash, data: event.returnValues }
  }

/**
 * The result of any library operation.
 *
 * @typedef {Object} OperationResult
 * @property {strict} transactionHash The hash of the resulting transaction.
 * @property {Object} data The returned data in the transaction logs for the operation.
 */

/**
 * Buy MET in auction.
 *
 * @param {string} value The coins to send to the contract.
 * @returns {Promise<OperationResult>} The purchase result.
 */
Metronome.prototype.buyMet = function (value) {
  const { address: from, web3 } = this

  const params = { from, value }
  return this.getContracts()
    .then(contracts =>
      metOps.buyMet(web3, contracts, params)
        .then(unwrapPromiEvent)
        .then(checkReceiptStatus)
        .then(parseReceiptLogs(contracts.Auctions))
        .then(findEventLog('LogAuctionFundsIn'))
    )
}

/**
 * Transfer MET.
 *
 * @param {string} to The recipient address.
 * @param {string} value The amount to transfer.
 * @returns {Promise<OperationResult>} The transfer result.
 */
Metronome.prototype.sendMet = function (to, value) {
  const { address: from } = this

  const params = { to, value }
  const options = { from }
  return this.getContracts()
    .then(contracts => metOps.sendMet(contracts, params, options))
    .then(unwrapPromiEvent)
    .then(checkReceiptStatus)
    .then(findEventLog('Transfer'))
}

/**
 * Set MET allowance.
 *
 * @param {string} spender The address allowed to spend tokens.
 * @param {string} value The amount to approve.
 * @returns {Promise<OperationResult>} The allowance result.
 */
Metronome.prototype.approveMet = function (spender, value) {
  const { address: from } = this

  const params = { spender, value }
  const options = { from }
  return this.getContracts()
    .then(contracts => metOps.approveMet(contracts, params, options))
    .then(unwrapPromiEvent)
    .then(checkReceiptStatus)
    .then(findEventLog('Approval'))
}

/**
 * Convert coins to MET.
 *
 * @param {string} value The coin amount to convert.
 * @param {string} [minReturn] Will cancel conversion if minReturn tokens are not obtained.
 * @returns {Promise<OperationResult>} The conversion result.
 */
Metronome.prototype.convertCoinsToMet = function (value, minReturn) {
  const { address: from } = this

  const params = { minReturn }
  const options = { from, value }
  return this.getContracts()
    .then(contracts => metOps.convertCoinsToMet(contracts, params, options))
    .then(unwrapPromiEvent)
    .then(checkReceiptStatus)
    .then(findEventLog('ConvertEthToMet'))
}

/**
 * Convert MET to coins.
 *
 * This function can result in up to 3 transactions depending on the previous
 * allowance level granted to the AutonomousConverter contract. Only the last
 * operation -the conversion- will be returned as the result of calling this
 * function.
 *
 * @param {string} amount The MET amount to convert.
 * @param {string} [minReturn] Will cancel conversion if minReturn tokens are not obtained.
 * @returns {Promise<OperationResult>} The conversion result.
 */
Metronome.prototype.convertMetToCoins = function (amount, minReturn) {
  const { address: from, web3 } = this

  const params = { amount, minReturn }
  const options = { from }
  return this.getContracts()
    .then(contracts =>
      metOps.convertMetToCoins(web3, contracts, params, options)
    )
    .then(results => results[results.length - 1])
    .then(unwrapPromiEvent)
    .then(checkReceiptStatus)
    .then(findEventLog('ConvertMetToEth'))
}

/**
 * Initiate an export of MET to another chain and obtain the burn data.
 *
 * @param {DestinationChainData} destinationData The destination chain data.
 * @param {string} amount The MET amount to burn and export.
 * @returns {Promise<OperationResult>} The export result.
 */
Metronome.prototype.exportMet = function (destinationData, amount) {
  const { address: from } = this

  const params = { amount, destinationData }
  const options = { from }
  return this.getContracts()
    .then(contracts => metOps.exportMet(contracts, params, options)
      .then(unwrapPromiEvent)
      .then(checkReceiptStatus)
      .then(parseReceiptLogs(contracts.TokenPorter))
      .then(findEventLog('LogExportReceipt'))
    )
}

/**
 * Request the import of MET burned on another chain.
 *
 * @param {OriginChainData} originData The origin chain data.
 * @param {Object} exportData The data obtained when the tokens were exported.
 * @param {string} proof The burn proof on the origin chain.
 * @returns {Promise<OperationResult>} The import request result.
 */
Metronome.prototype.importMet = function (originData, exportData, proof) {
  const { address: from } = this

  const params = { exportData, originData, proof }
  const options = { from }
  return this.getContracts()
    .then(contracts => metOps.importMet(contracts, params, options)
      .then(unwrapPromiEvent)
      .then(checkReceiptStatus)
      .then(parseReceiptLogs(contracts.TokenPorter))
      .then(findEventLog('LogImportRequest'))
    )
}

module.exports = Metronome

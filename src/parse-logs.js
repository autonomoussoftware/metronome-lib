'use strict'

const abi = require('web3-eth-abi')

/**
 * Parse receipt searching for unidentified events of the given contract.
 *
 * Adapted from Contract#_executeMethod and Contract#_decodeEventABI of web3.js
 * beta 37.
 *
 * @param {Object} contract The Web3 contract object.
 * @param {Object} receipt The transaction receipt to parse.
 * @returns {Object} The patched receipt.
 */
function parseContractLogs (contract, receipt) {
  const events = []

  // Parse logs into events
  if (receipt.logs) {
    receipt.logs.forEach(function (log) {
      const descriptor = (log.address === contract.options.address)
        ? contract.options.jsonInterface
          .find(desc => desc.signature === log.topics[0])
        : { anonymous: true, inputs: [] }

      log.event = descriptor.name
      log.signature = (descriptor.anonymous || !log.topics[0])
        ? null
        : log.topics[0]
      // @ts-ignore: web3-eth-abi types in DefinitelyTyped are for beta.38+
      log.returnValues = abi.decodeLog(
        descriptor.inputs,
        log.data,
        descriptor.anonymous ? log.topics : log.topics.slice(1)
      )
      delete log.returnValues.__length__

      log.raw = {
        data: log.data,
        topics: log.topics
      }
      delete log.data
      delete log.topics

      events.push(log)
    })

    delete receipt.logs
    receipt.events = {}
  }

  // Decode more events
  Object.keys(receipt.events).forEach(function (n) {
    const event = receipt.events[n]

    if (event.address !== contract.options.address || event.signature) {
      return
    }

    const descriptor = contract.options.jsonInterface.find(desc =>
      desc.signature === event.raw.topics[0]
    )
    event.event = descriptor.name
    event.signature = descriptor.signature
    // @ts-ignore: web3-eth-abi types in DefinitelyTyped are for beta.38+
    event.returnValues = abi.decodeLog(
      descriptor.inputs,
      event.raw.data,
      descriptor.anonymous ? event.raw.topics : event.raw.topics.slice(1)
    )
    delete event.returnValues.__length__

    events.push(event)
    delete receipt.events[n]
  })

  // Repopulate the receipt events
  let count = 0
  events.forEach(function (ev) {
    if (ev.event) {
      if (receipt.events[ev.event]) {
        if (Array.isArray(receipt.events[ ev.event ])) {
          receipt.events[ ev.event ].push(ev)
        } else {
          receipt.events[ev.event] = [receipt.events[ev.event], ev]
        }
      } else {
        receipt.events[ ev.event ] = ev
      }
    } else {
      receipt.events[count] = ev
      count++
    }
  })

  return receipt
}

module.exports = parseContractLogs

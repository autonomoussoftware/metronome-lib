'use strict'

const MetronomeContracts = require('metronome-contracts')
const Web3 = require('web3')

require('chai').should()

const fixtures = require('./fixtures/receipts')

const parseContractLogs = require('../src/parse-logs')

describe('Receipt logs parser', function () {
  it('should parse sendTransaction logs into events', function () {
    const { Auctions } = new MetronomeContracts(new Web3(), 'ropsten')
    const { buyMetReceipt, parsedLogAuctionFundsInEvent } = fixtures
    const parsedReceipt = parseContractLogs(Auctions, buyMetReceipt)
    parsedReceipt.events.should.have.property('LogAuctionFundsIn')
      .that.deep.equals(parsedLogAuctionFundsInEvent)
  })

  it('should parse unidentified events in contract call', function () {
    const { TokenPorter } = new MetronomeContracts(new Web3(), 'ropsten')
    const { exportMetReceipt, parsedLogExportReceiptEvent } = fixtures
    const parsedReceipt = parseContractLogs(TokenPorter, exportMetReceipt)
    parsedReceipt.events.should.not.have.property('0')
    parsedReceipt.events.should.have.property('LogExportReceipt')
      .that.deep.equals(parsedLogExportReceiptEvent)
  })
})

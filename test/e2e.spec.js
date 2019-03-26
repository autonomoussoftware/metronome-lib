'use strict'

const Web3 = require('web3')

require('chai').should()
require('dotenv').config()

const Metronome = require('../src')

describe('met.js', function () {
  if (!process.env.E2E) {
    return
  }

  let web3Instances

  before(function () {
    web3Instances = {
      ropsten: new Web3(process.env.ROPSTEN),
      morden: new Web3(process.env.MORDEN)
    }
  })

  it('should get Metronome chain name', function () {
    const met = new Metronome(web3Instances.ropsten)
    return met.getMetChainName()
      .then(function (chain) {
        chain.should.equals('ETH')
      })
  })

  it('should get Metronome status', function () {
    const met = new Metronome(web3Instances.ropsten)
    return met.getStatus()
      .then(function (status) {
        status.should.have.nested.property('auction.currAuction')
          .to.be.a('string')
        status.should.have.nested.property('auction.currentAuctionPrice')
          .to.be.a('string')
        status.should.have.nested.property('auction.dailyAuctionStartTime')
          .to.be.a('number')
        status.should.have.nested.property('auction.genesisTime')
          .to.be.a('number')
        status.should.have.nested.property('auction.lastPurchasePrice')
          .to.be.a('string')
        status.should.have.nested.property('auction.lastPurchaseTime')
          .to.be.a('number')
        status.should.have.nested.property('auction.nextAuctionTime')
          .to.be.a('number')
        status.should.have.nested.property('auction.minting')
          .to.be.a('string')
        status.should.have.nested.property('converter.metBalance')
          .to.be.a('string')
        status.should.have.nested.property('converter.ethBalance')
          .to.be.a('string')
        status.should.have.nested.property('converter.currentConverterPrice')
          .to.be.a('string')
      })
  })

  // it should get auction status

  // it should get converter status

  it('should buy MET in auction', function () {
    this.timeout(0)
    const met = new Metronome(web3Instances.ropsten)
    met.setAccount(process.env.MNEMONIC)
    return met.buyMet('1')
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
        result.should.have.property('data')
          .to.be.an('object')
        result.data.should.have.property('tokens')
          .to.be.a('string')
        result.data.should.have.property('purchasePrice')
          .to.be.a('string')
        result.data.should.have.property('refund')
          .to.be.a('string')
      })
  })

  it('should get MET balance', function () {
    const met = new Metronome(web3Instances.ropsten)
    met.setAccount(process.env.MNEMONIC)
    return met.getMetBalance()
      .then(function (balance) {
        balance.should.be.a('string')
      })
  })

  it('should get MET balance for an address', function () {
    const met = new Metronome(web3Instances.ropsten)
    return met.getMetBalance('0xb29a60219268D4D58aeF50F113CC6c059D70da7c')
      .then(function (balance) {
        balance.should.be.a('string')
      })
  })

  it('should send MET', function () {
    this.timeout(0)
    const met = new Metronome(web3Instances.ropsten)
    met.setAccount(process.env.MNEMONIC)
    return met.sendMet(met.address, '1')
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
      })
  })

  // it should multi-send MET

  // it should listen for incoming MET

  it('should get coins to MET result', function () {
    const met = new Metronome(web3Instances.ropsten)
    return met.getCoinsToMetResult('1000000000000000')
      .then(function (result) {
        result.should.be.a('string')
      })
  })

  it('should get MET to coins result', function () {
    const met = new Metronome(web3Instances.ropsten)
    return met.getMetToCoinsResult('1000000000000000')
      .then(function (result) {
        result.should.be.a('string')
      })
  })

  it('should convert coins to MET', function () {
    this.timeout(0)
    const met = new Metronome(web3Instances.ropsten)
    met.setAccount(process.env.MNEMONIC)
    return met.convertCoinsToMet('1000000000000000', '1')
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
        result.should.have.property('data')
          .to.be.an('object')
        result.data.should.have.property('met')
          .to.be.a('string')
      })
  })

  it('should convert MET to coins', function () {
    this.timeout(0)
    const met = new Metronome(web3Instances.ropsten)
    met.setAccount(process.env.MNEMONIC)
    return met.convertMetToCoins('1000000000000000', '1')
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
        result.should.have.property('data')
          .to.be.an('object')
        result.data.should.have.property('eth')
          .to.be.a('string')
      })
  })

  it('should port MET', function () {
    this.timeout(0)
    const ropstenMet = new Metronome(web3Instances.ropsten)
    ropstenMet.setAccount(process.env.MNEMONIC)
    const mordenMet = new Metronome(web3Instances.morden)
    mordenMet.setAccount(process.env.MNEMONIC)
    return mordenMet.getDestinationChainData()
      .then(destinationChainData =>
        ropstenMet.exportMet(destinationChainData, '1000000000000000')
      )
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
        result.should.have.property('data')
          .to.be.an('object')
        result.data.should.have.property('currentBurnHash')
          .to.be.a('string')
        result.data.should.have.property('destinationChain')
          .to.be.a('string')
        result.data.should.have.property('destinationMetronomeAddr')
          .to.be.a('string')
          .that.have.lengthOf(42)
        result.data.should.have.property('destinationRecipientAddr')
          .to.be.a('string')
          .that.have.lengthOf(42)
        result.data.should.have.property('amountToBurn')
          .to.be.a('string')
        result.data.should.have.property('fee')
          .to.be.a('string')
        result.data.should.have.property('extraData')
          .to.be.a('string')
        result.data.should.have.property('currentTick')
          .to.be.a('string')
        result.data.should.have.property('burnSequence')
          .to.be.a('string')
        result.data.should.have.property('prevBurnHash')
          .to.be.a('string')
        result.data.should.have.property('dailyMintable')
          .to.be.a('string')
        result.data.should.have.property('supplyOnAllChains')
          .to.be.an('array')
        result.data.should.have.property('blockTimestamp')
          .to.be.a('string')
        return Promise.all([
          ropstenMet.getOriginChainData(),
          result.data,
          ropstenMet.getExportProof(result.data)
        ])
      })
      .then(function ([originChainData, exportData, proof]) {
        return mordenMet.importMet(originChainData, exportData, proof)
      })
      .then(function (result) {
        result.should.have.property('transactionHash')
          .to.be.a('string')
          .that.have.lengthOf(66)
      })
  })

  // it should get all pending MET imports

  // it should request MET import

  // it should listen for incoming MET export

  // it should manage MET subscriptions

  after(function () {
    web3Instances.morden.currentProvider.disconnect()
    web3Instances.ropsten.currentProvider.disconnect()
  })
})

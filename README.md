# metronome-lib

[![Build Status](https://travis-ci.com/autonomoussoftware/metronome-lib.svg?branch=master)](https://travis-ci.com/autonomoussoftware/metronome-lib)

A JavaScript library for the Metronome Token.

This library is a thin wrapper around `web3`, `metronome-contracts` and `metronome-ops` to easy even more the interaction with the Metronome contracts.
Operations like buying MET tokens in an auction, converting or porting tokens is mostly a one-liner. 

## Installation

```shell
npm install metronome-lib
```

## Basic usage

```js
const Metronome = require('metronome-lib')

// Get the status of the Metronome auction and converter contracts
const met = new Metronome(web3Instance)
met.getStatus().then(status => { /* ... */ })

// But MET in the ongoing auction
met.setAccount(myPrivateKeyOrMnemonic)
met.buyMet('1000000000000000000').then(purchase => { /* ... */ })

// Check my MET balance
met.getMetBalance().then(balance => { /* ... */ })

// Send MET to another account
met.sendMet(destinationAddress).then(transfer => { /* ... */ })

// Convert ether to MET
met.convertCoinsToMet('1000000000000000000').then(conv => { /* ... */ })

// Convert MET back to ether
met.convertMetToCoins('1000000000000000000').then(back => { /* ... */ })

// Port MET to another chain
const destMet = new Metronome(web3InstanceOnDestinationChain) // I.e. ETC
Promise.all([destMet.getDestinationChainData(), met.getOriginChainData()])
  .then(([destChainData, origChainData]) => met.exportMet(destChainData, '1000000000000000000')
    .then(exp => met.getExportProof(exp.data)
      .then(proof => destMet.importMet(origChainData, exp.data, proof))
    )
  )
  .then(imp => { /* ... */ })
```

## API

<a name="new_Metronome_new"></a>

### new Metronome(web3)
Create a Metronome object ready to work with the Metronome contracts.

The proper contracts-set will be selected based on which chain the web3
instance is connected to.


| Param | Type | Description |
| --- | --- | --- |
| web3 | <code>Object</code> | A Web3 instance. |

<a name="Metronome+getContracts"></a>

### metronome.getContracts() ⇒ [<code>Promise.&lt;MetronomeContractsInstance&gt;</code>](#MetronomeContractsInstance)
Get the Metronome contracts of the library instance.

<a name="Metronome+getMetChainName"></a>

### metronome.getMetChainName() ⇒ <code>Promise.&lt;string&gt;</code>
Get the Metronome chain name.

**Returns**: <code>Promise.&lt;string&gt;</code> - The name i.e. `'ETH'`.  
<a name="Metronome+getAuctionStatus"></a>

### metronome.getAuctionStatus() ⇒ [<code>Promise.&lt;AuctionStatus&gt;</code>](#AuctionStatus)
Get the status of the Auctions contract.

**Returns**: [<code>Promise.&lt;AuctionStatus&gt;</code>](#AuctionStatus) - The status.  
<a name="Metronome+getConverterStatus"></a>

### metronome.getConverterStatus() ⇒ [<code>Promise.&lt;AutonomousConverterStatus&gt;</code>](#AutonomousConverterStatus)
Get the status of the AutonomousConverter contract.

**Returns**: [<code>Promise.&lt;AutonomousConverterStatus&gt;</code>](#AutonomousConverterStatus) - The status.  
<a name="Metronome+getStatus"></a>

### metronome.getStatus() ⇒ [<code>Promise.&lt;AuctionAndConverterStatus&gt;</code>](#AuctionAndConverterStatus)
Get the status of both the Auctions and AutonomousConverter contracts.

**Returns**: [<code>Promise.&lt;AuctionAndConverterStatus&gt;</code>](#AuctionAndConverterStatus) - The statuses.  
<a name="Metronome+getMetBalance"></a>

### metronome.getMetBalance([owner]) ⇒ <code>Promise.&lt;string&gt;</code>
Get the MET balance of an account.

**Returns**: <code>Promise.&lt;string&gt;</code> - The MET balance.  

| Param | Type | Description |
| --- | --- | --- |
| [owner] | <code>string</code> | The address of the account. Defaults to the set account. |

<a name="Metronome+getCoinsToMetResult"></a>

### metronome.getCoinsToMetResult(depositAmount) ⇒ <code>Promise.&lt;string&gt;</code>
Calculate the coin to MET return conversion.

**Returns**: <code>Promise.&lt;string&gt;</code> - The MET amount that would be returned.  

| Param | Type | Description |
| --- | --- | --- |
| depositAmount | <code>string</code> | The coin amount to convert. |

<a name="Metronome+getMetToCoinsResult"></a>

### metronome.getMetToCoinsResult(depositAmount) ⇒ <code>Promise.&lt;string&gt;</code>
Calculate the MET to coin return conversion.

**Returns**: <code>Promise.&lt;string&gt;</code> - The coin amount that would be returned.  

| Param | Type | Description |
| --- | --- | --- |
| depositAmount | <code>string</code> | The MET amount to convert. |

<a name="Metronome+getDestinationChainData"></a>

### metronome.getDestinationChainData() ⇒ [<code>Promise.&lt;DestinationChainData&gt;</code>](#DestinationChainData)
Get the destination chain data to perform an export.

**Returns**: [<code>Promise.&lt;DestinationChainData&gt;</code>](#DestinationChainData) - The chain data.  
<a name="Metronome+getOriginChainData"></a>

### metronome.getOriginChainData() ⇒ [<code>Promise.&lt;OriginChainData&gt;</code>](#OriginChainData)
Get the destination chain data to perform an export.

**Returns**: [<code>Promise.&lt;OriginChainData&gt;</code>](#OriginChainData) - The chain data.  
<a name="Metronome+getExportProof"></a>

### metronome.getExportProof(exportData) ⇒ <code>Promise.&lt;string&gt;</code>
Get the Merkle root of a last 16 burns.

**Returns**: <code>Promise.&lt;string&gt;</code> - The Merkle root hash.  

| Param | Type | Description |
| --- | --- | --- |
| exportData | <code>Object</code> | The returned export data. |
| exportData.burnSequence | <code>string</code> | The burn sequence number. |

<a name="Metronome+setAccount"></a>

### metronome.setAccount(privKeyOrMnemonic, options) ⇒ [<code>Metronome</code>](#Metronome)
Set the default account for this library instance.

All transactions will be signed and sent using the default account.

**Returns**: [<code>Metronome</code>](#Metronome) - The library instance.  

| Param | Type | Description |
| --- | --- | --- |
| privKeyOrMnemonic | <code>string</code> | Either an `0x` prefixed hex private key or a 12-word mnemonic. |
| options | <code>Object</code> |  |
| [options.derivationPath] | <code>string</code> | The key derivarion path to derive the keys from the mnemonic. Defaults to `m/44'/60'/0'/0/0`. |
| [options.password] | <code>string</code> | The mnemonic password. |

<a name="Metronome+buyMet"></a>

### metronome.buyMet(value) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Buy MET in auction.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The purchase result.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The coins to send to the contract. |

<a name="Metronome+sendMet"></a>

### metronome.sendMet(to, value) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Transfer MET.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The transfer result.  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>string</code> | The recipient address. |
| value | <code>string</code> | The amount to transfer. |

<a name="Metronome+approveMet"></a>

### metronome.approveMet(spender, value) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Set MET allowance.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The allowance result.  

| Param | Type | Description |
| --- | --- | --- |
| spender | <code>string</code> | The address allowed to spend tokens. |
| value | <code>string</code> | The amount to approve. |

<a name="Metronome+convertCoinsToMet"></a>

### metronome.convertCoinsToMet(value, [minReturn]) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Convert coins to MET.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The conversion result.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The coin amount to convert. |
| [minReturn] | <code>string</code> | Will cancel conversion if minReturn tokens are not obtained. |

<a name="Metronome+convertMetToCoins"></a>

### metronome.convertMetToCoins(amount, [minReturn]) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Convert MET to coins.

This function can result in up to 3 transactions depending on the previous
allowance level granted to the AutonomousConverter contract. Only the last
operation -the conversion- will be returned as the result of calling this
function.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The conversion result.  

| Param | Type | Description |
| --- | --- | --- |
| amount | <code>string</code> | The MET amount to convert. |
| [minReturn] | <code>string</code> | Will cancel conversion if minReturn tokens are not obtained. |

<a name="Metronome+exportMet"></a>

### metronome.exportMet(destinationData, amount) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Initiate an export of MET to another chain and obtain the burn data.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The export result.  

| Param | Type | Description |
| --- | --- | --- |
| destinationData | [<code>DestinationChainData</code>](#DestinationChainData) | The destination chain data. |
| amount | <code>string</code> | The MET amount to burn and export. |

<a name="Metronome+importMet"></a>

### metronome.importMet(originData, exportData, proof) ⇒ [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult)
Request the import of MET burned on another chain.

**Returns**: [<code>Promise.&lt;OperationResult&gt;</code>](#OperationResult) - The import request result.  

| Param | Type | Description |
| --- | --- | --- |
| originData | [<code>OriginChainData</code>](#OriginChainData) | The origin chain data. |
| exportData | <code>Object</code> | The data obtained when the tokens were exported. |
| proof | <code>string</code> | The burn proof on the origin chain. |

<a name="MetronomeContractsInstance"></a>

### MetronomeContractsInstance : <code>Object</code>
A Metronome contracts set.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Auctions | <code>Object</code> | The Web3 contract instance. |
| AutonomousConverter | <code>Object</code> | The Web3 contract instance. |
| METToken | <code>Object</code> | The Web3 contract instance. |
| TokenPorter | <code>Object</code> | The Web3 contract instance. |

<a name="AuctionStatus"></a>

### AuctionStatus : <code>Object.&lt;string, any&gt;</code>
An object representing the auction status.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| currAuction | <code>string</code> | The auction number. |
| currentAuctionPrice | <code>string</code> | The MET price. |
| dailyAuctionStartTime | <code>number</code> | The daily auctions start time (ms). |
| genesisTime | <code>number</code> | The ISA start time (ms). |
| lastPurchasePrice | <code>string</code> | The last purchase price. |
| lastPurchaseTime | <code>number</code> | The last purchase time (ms). |
| minting | <code>string</code> | The coins available in the current auction. |
| nextAuctionTime | <code>number</code> | The next auction start time (ms). |

<a name="AutonomousConverterStatus"></a>

### AutonomousConverterStatus : <code>Object</code>
An object representing the autonomous converter status.

The converter price returned is for informational purposes only as the
conversion price will change depending on the amount sent and the contract's
balance.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| currentConverterPrice | <code>string</code> | The coins returned for 1 MET. |
| ethBalance | <code>string</code> | The contract's coins balance. I.e. ETH. |
| metBalance | <code>string</code> | The contract's MET balance. |

<a name="AuctionAndConverterStatus"></a>

### AuctionAndConverterStatus : <code>Object</code>
A combined status.

**Properties**

| Name | Type |
| --- | --- |
| auction | [<code>AuctionStatus</code>](#AuctionStatus) | 
| converter | [<code>AutonomousConverterStatus</code>](#AutonomousConverterStatus) | 

<a name="DestinationChainData"></a>

### DestinationChainData : <code>Object</code>
An object having destination contracts data.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| destChain | <code>string</code> | The Metronome chain name. |
| destMetronomeAddr | <code>string</code> | The METToken contract address. |

<a name="OriginChainData"></a>

### OriginChainData : <code>Object</code>
An object having destination contracts data.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dailyAuctionStartTime | <code>number</code> | The METToken contract address. |
| genesisTime | <code>number</code> | The METToken contract address. |
| originChain | <code>string</code> | The Metronome chain name. |

<a name="OperationResult"></a>

### OperationResult : <code>Object</code>
The result of any library operation.

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| transactionHash | <code>strict</code> | The hash of the resulting transaction. |
| data | <code>Object</code> | The returned data in the transaction logs for the operation. |

## License

MIT

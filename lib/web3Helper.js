// web3Helper
const Web3 = require('web3');
const utils = require('./utils');
const bcUtil = require('./bcUtil');
const p = require('./p');
const SolidityEvent = require("web3/lib/web3/event.js");
const SolidityCoder = require("web3/lib/solidity/coder.js");

//---service description
const providerURL = "http://10.10.10.1";
const providerPort = "8545";

//---contract descriptions
var costForTA = 3252948;
var costForStash = 417693;
var costForPledge = 452123;
var costForAcceptPledge = 952123;
var costForTransfer = 952123;
//var taAddress = '0x305eb0e564767a980057394fedcbf2b70e975fce';
var taAddress = '0x62147e24df5b30a481b9f98165add21841744137';
var taABI = [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_origStashName",
            "type": "string"
          },
          {
            "name": "_destStashName",
            "type": "string"
          },
          {
            "name": "_transactionAmt",
            "type": "uint256"
          },
          {
            "name": "_remarks",
            "type": "string"
          }
        ],
        "name": "initTransfer",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_transactionNum",
            "type": "uint256"
          }
        ],
        "name": "getTransaction",
        "outputs": [
          {
            "name": "transactionType",
            "type": "uint8"
          },
          {
            "name": "origStashName",
            "type": "string"
          },
          {
            "name": "destStashName",
            "type": "string"
          },
          {
            "name": "transactionAmt",
            "type": "uint256"
          },
          {
            "name": "transactionRemarks",
            "type": "string"
          },
          {
            "name": "transactionStatus",
            "type": "uint8"
          },
          {
            "name": "exists",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          }
        ],
        "name": "stashExist",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          }
        ],
        "name": "getBalance",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          },
          {
            "name": "_bankAddress",
            "type": "address"
          }
        ],
        "name": "createBankStash",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_transactionNum",
            "type": "uint256"
          },
          {
            "name": "_remarks",
            "type": "string"
          }
        ],
        "name": "rejectTransfer",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_transactionNum",
            "type": "uint256"
          },
          {
            "name": "_remarks",
            "type": "string"
          }
        ],
        "name": "rejectPledge",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "transactions",
        "outputs": [
          {
            "name": "transactionType",
            "type": "uint8"
          },
          {
            "name": "origStashName",
            "type": "string"
          },
          {
            "name": "destStashName",
            "type": "string"
          },
          {
            "name": "transactionAmt",
            "type": "uint256"
          },
          {
            "name": "transactionRemarks",
            "type": "string"
          },
          {
            "name": "transactionStatus",
            "type": "uint8"
          },
          {
            "name": "exists",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          }
        ],
        "name": "getBankStash",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "changeOwner",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_destStashName",
            "type": "string"
          },
          {
            "name": "_transactionAmt",
            "type": "uint256"
          },
          {
            "name": "_remarks",
            "type": "string"
          },
          {
            "name": "_transactionType",
            "type": "uint8"
          }
        ],
        "name": "requestPledgeRedeem",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_transactionNum",
            "type": "uint256"
          },
          {
            "name": "_remarks",
            "type": "string"
          }
        ],
        "name": "acceptPledgeRedeem",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "_name",
            "type": "string"
          },
          {
            "indexed": false,
            "name": "_bank",
            "type": "address"
          }
        ],
        "name": "StashCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "transactionId",
            "type": "uint256"
          }
        ],
        "name": "PledgeRedeemRequested",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "transactionId",
            "type": "uint256"
          }
        ],
        "name": "PledgeRedeemAccepted",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "transactionId",
            "type": "uint256"
          }
        ],
        "name": "PledgeRejected",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "transactionId",
            "type": "uint256"
          }
        ],
        "name": "PledgeCancelled",
        "type": "event"
      }
    ];

var stABI = [
      {
        "constant": false,
        "inputs": [],
        "name": "nameRegAddress",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "getBalance",
        "outputs": [
          {
            "name": "_stashBalance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "bankName",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "bankAddr",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "kill",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          },
          {
            "name": "_dAmt",
            "type": "uint256"
          },
          {
            "name": "txnId",
            "type": "uint256"
          }
        ],
        "name": "debit",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "name",
            "type": "bytes32"
          }
        ],
        "name": "named",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "changeOwner",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          },
          {
            "name": "_crAmt",
            "type": "uint256"
          },
          {
            "name": "txnId",
            "type": "uint256"
          }
        ],
        "name": "credit",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "_bankName",
            "type": "string"
          },
          {
            "name": "_bankAddr",
            "type": "address"
          },
          {
            "name": "_stashBalance",
            "type": "uint256"
          }
        ],
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "txID",
            "type": "uint256"
          }
        ],
        "name": "BalanceChanged",
        "type": "event"
      }
    ];	
	
var web3;
var banks;
var TransactionAgent;
var ta; 
var txnNo = 0;
var expectFollowUp = {};
var stashAddress = {};

//---connect to blockchain
function getWeb3() {
	if (typeof web3 !== 'undefined') {
		if (web3.isConnected()) return web3;
		web3 = new Web3(web3.currentProvider);
	} else {
		// set the provider you want from Web3.providers
		web3 = new Web3(new Web3.providers.HttpProvider(providerURL + ":" + providerPort));
	}
	return web3;
}

function getBanks() {
	if (!banks) {
		var accounts = getWeb3().eth.accounts;
		/*banks = {
			ZYACSGD0 : '0x7d8b4147dd7ecb37055562959700122f59a15684',
			BOFASG20 : '0xa9348b1751d134bbd4183839c888fddf48ce686f',
			ZYCNSGS0 : '0x5d9624acbef7343b4b7e2251002990d7ee86e0a2',
			DBSSSGS0 : '0xa3a5e5ccfbc96bad90f2d573089b3a1aa979f628',
			CHASSGS0 : '0xe1fced84ec285cb7b90a0bd6e67fe900489de247',
			ZYECHKH0 : '0xf04fab63b8ec0cf0c23e33254612dbd3659dc1d1',
			OCBCSGS0 : '0x585eee01c3fa73e2fd2bf69a5397ca1011a8f787',
			UOVBSGS0 : '0x4b400173300e99e418d8dbcadcf2081af7544a30'
		};*/
		
		banks = {
			ZYACSGD0 : accounts[0],
			BOFASG20 : accounts[1],
			ZYCNSGS0 : accounts[2],
			DBSSSGS0 : accounts[3],
			CHASSGS0 : accounts[4],
			ZYECHKH0 : accounts[5],
			OCBCSGS0 : accounts[6],
			UOVBSGS0 : accounts[7]
		};
	}
	return banks;
}

//---retrieving the singleton TransactionAgent
function getTransactionAgent() {
	if (typeof ta == 'undefined') {
		if (!TransactionAgent) {
			TransactionAgent = web3.eth.contract(taABI);
			ta = TransactionAgent.at(taAddress);
		}
	}
	return ta;
}

//---using TransactionAgent to create a stash for a bank
function createStash(bankName) {
	console.log('trying to create stash for '+ bankName + ' by ' + getBanks().ZYACSGD0);
	var txnHash = getTransactionAgent().createBankStash(bankName, getBanks()[bankName], txnNo++, {from: getBanks().ZYACSGD0, gas: costForStash});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);	
}

//---using TransactionAgent to initiate pledge for a stash 
function pledgeStash(bankName, amt, memo, redeemFlag) {
	redeemFlag |= 0;
	var txnHash = getTransactionAgent().requestPledgeRedeem(bankName, amt, memo, redeemFlag, {from: getBanks().ZYACSGD0, gas: costForPledge});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---using TransactionAgent to accept pledge for a stash 
function acceptPledgeStash(txnId, memo) {
	var txnHash = getTransactionAgent().acceptPledgeRedeem(txnId, memo, {from: getBanks().ZYACSGD0, gas: costForAcceptPledge});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---using TransactionAgent to transfer between stashes 
function initTransfer(fromBank, toBank, amt, memo) {
	var txnHash = getTransactionAgent().initTransfer(fromBank, toBank, amt, memo, {from: getBanks().ZYACSGD0, gas: costForTransfer});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---get banks' balance
function getBankBalance(bankNames) {
	if (Array.isArray(bankNames)) {
		var returnVal = {};
		var balance;
		bankNames.forEach(function(bankName) {
			balance = getTransactionAgent().getBalance.call(bankName);
			if (typeof balance !== 'undefined') returnVal[bankName] = balance.valueOf(); 
		});
		return returnVal;
	}
	return null;
}

//---get banks' Stash
function getStash(bankName) {
	return getTransactionAgent().getBankStash.call(bankName);
}

function getTransactionReceipt(txnHash) {
	return getWeb3().eth.getTransactionReceipt(txnHash);
}

//---get function hashes from abi (only call once)
function getFunctionHashes(abi) {
  var hashes = [];
  for (var i=0; i<abi.length; i++) {
    var item = abi[i];
    if (item.type != "function") continue;
    var signature = item.name + "(" + item.inputs.map(function(input) {return input.type;}).join(",") + ")";
    var hash = web3.sha3(signature);
    //console.log(item.name + '=' + hash);	
	
    hashes.push({name: item.name, hash: hash, inputs: item.inputs, inputTypes: item.inputs.map(function(i) { return i.type}) });
  }
  return hashes;
}

//---get function signature from abi function hash
function findFunctionByHash(hashes, functionHash) {
  for (var i=0; i<hashes.length; i++) {
    if (hashes[i].hash.substring(0, 10) == functionHash.substring(0, 10))
      return hashes[i];
  }
  return null;
}

//---get function call Input Params from the txn.input field
function getInputParams(inputs, types, inputString) {
	var inputData = SolidityCoder.decodeParams(types, inputString.substring(10));
	var returnVal = {};
	if (inputData != null) {
		inputs.forEach(function(input, i) {
			returnVal[input.name] = inputData[i];
		});
	}
	return returnVal;
}

//--- An internal method to get decoder for topic and get events
function internalGetTopicDecoders(abi) {
	if (abi) {
		return abi.filter(function (json) {
			return json.type === 'event';
		}).map(function(json) {
			// note first and third params required only by enocde and execute;
			// so don't call those!
			return new SolidityEvent(null, json, null);
		});
	}
}

var taDecoders = internalGetTopicDecoders(taABI);
var stDecoders = internalGetTopicDecoders(stABI);

//---parse transaction receipts
function parseReceipts(logs, contractClass) {
    return logs.map(function (log) {
		var decoders = stDecoders;
		if (!contractClass) contractClass = 'Stash';
		if (log.address == taAddress) {
			decoders = taDecoders;
			contractClass = 'TransactionAgent';
		}
        return [contractClass, decoders.find(function(decoder) {
            return (decoder.signature() == log.topics[0].replace("0x",""));
        }).decode(log)];
    })
}

Object.prototype.getKeyByValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
}

//---simplify block view
function blockProcessor(block) {
	var returnVal;
	if (block) {
		returnVal = {};
		returnVal['blockNo'] = block.number;
		returnVal['blockHash'] = block.hash;
		returnVal['parentHash'] = block.parentHash;
		returnVal['stateRoot'] = block.stateRoot;
		returnVal['gasUsed'] = block.gasUsed;
		returnVal['transactions'] = block.transactions;
	}
	return returnVal;
}

//---combine the outputs, cache the data, link the data
function functionCallProcessor(blockno, txnHash, fnName, inputs, decodedLogs) {
	/* ***** 
	output: 
		<- blockno - from log
		<- txn hash - from log
		<- function name 
		<- function call input params
		<- positivelyAffected - from inputs or from event
		<- negativelyAffected - from inputs or from event 
		<- events 
			<- event name
			<- event args
			<- positivelyAffected - from event
			<- negativelyAffected - from event
	cache: into expectFollowUp - txnNo => { bankName, txn hash, status: failed/pending/accepted/rejected } 
		<- this is mainly for the 2 part actions
	cache: bank stash addresses - bankName => address 
		<- transfers (bank name in fn calls, bank address in events), 
		<- pledge/Redeem (bank name in pledge function call, bank address in accept events)
	update status: in expectFollowUp - find txnNo, mark status 
		<- accept or reject		
	***** */
	var returnVal = { blockno: blockno, txnHash: txnHash, fnName: fnName, inputs: inputs};
	switch (fnName) {
		case 'createBankStash':
			var type = 'stash creation';
			returnVal['fnName'] = type;
			returnVal.ind = 'neutral';
			if (Array.isArray(decodedLogs)) {
				returnVal['bankName'] = decodedLogs[0].log.args['_name'];
				//returnVal['bankName'] = 
				events = [{ name: 'stash created', args: decodedLogs[0].log.args, contract: decodedLogs[0].contract}];
				events.forEach(function(event) {
					event.bankName = event.args._name;
					event.blockno = blockno;
					event.txnHash = txnHash;
					event.side = 'neutral';
				});
				returnVal['events'] = events;
			}
			break;
		case 'requestPledgeRedeem': 
			var type = 'unknown';
			if (inputs['_transactionType'].valueOf() == 0) {
				type = 'pledge';
				returnVal['positivelyAffected'] = inputs['_destStashName'];
				returnVal.bankName = inputs['_destStashName'];
				returnVal.ind = 'positive';
			} else if (inputs['_transactionType'] == 1) {
				type = 'redeem';
				returnVal['negativelyAffected'] = inputs['_destStashName'];
				returnVal.bankName = inputs['_destStashName'];
				returnVal.ind = 'negative';
			}
			returnVal.amount = inputs._transactionAmt.valueOf();
			returnVal['fnName'] = type;
			if (type !== 'unknown') {
				if (Array.isArray(decodedLogs)) {
					//console.log(decodedLogs[0].);
					expectFollowUp[decodedLogs[0].log.args['transactionId'].valueOf()] = {type: type, bankName: inputs['_destStashName'], txnHash, status: 'pending'};	
					var event = { name: type, args: decodedLogs[0].log.args, blockno: blockno, txnHash: txnHash, bankName: inputs['_destStashName']};
					if (type == 'pledge') {
						event['positivelyAffected'] = returnVal['positivelyAffected'];
						event.side = 'positive';
					} else {
						event['negativelyAffected'] = returnVal['negativelyAffected'];
						event.side = 'negative';
					}
					event.contract = decodedLogs[0].contract;
					returnVal['events'] = [event];
				}
			}
			break;
		case 'acceptPledgeRedeem':
			var txnNo = inputs['_transactionNum'].valueOf();
			var expecting = expectFollowUp[txnNo];
			var bankName, type, side='unknown';
			if (expecting) {
				type = 'accept ' + expecting.type;
				bankName = expecting.bankName;
				side = expecting.type == 'pledge'?'positivelyAffected':'negativelyAffected';
				returnVal[side] = bankName;
				returnVal.ind = side.substring(0,8);
				returnVal.bankName = bankName;
				expecting.status = 'accepted';
			} else if (decodedLogs && decodedLogs.length > 1) {
				var stashOwner = stashAddress.getKeyByValue(decodedLogs[1].address);
				if (stashOwner) returnVal['bankName'] = stashOwner;
				type = 'accept pledge/Redeem';
			}
			returnVal['fnName'] = type;
			if (Array.isArray(decodedLogs)) {
				if (bankName && !stashAddress[bankName]) stashAddress[bankName] = decodedLogs[1].log.address;
				var events = [];
				var balanceChange = decodedLogs[0];
				var acceptance = decodedLogs[1];
				returnVal.amount = balanceChange.log.args.amount.valueOf();
				events.push({ name: type, args: acceptance.log.args, contract: acceptance.contract});
				events.push({ name: 'balance changed by ' + type, args: balanceChange.log.args, contract: balanceChange.contract});
				events.forEach(function(event) {
					if (side != 'unknown') { 
						event[side] = bankName;
						event.side = side.substring(0,8);;
					}
					event['bankName'] = bankName;
					event.blockno = blockno;
					event.txnHash = txnHash;
				});
				returnVal['events'] = events;
			} 
			break;
		case 'initTransfer':
			returnVal['fnName'] = 'transfer';
			returnVal['negativelyAffected'] = inputs['_origStashName'];
			returnVal['positivelyAffected'] = inputs['_destStashName'];
			returnVal.amount = inputs._transactionAmt.valueOf();
			returnVal.ind = "both";
			if (Array.isArray(decodedLogs) && decodedLogs.length > 0) {
				var payer = decodedLogs[0];
				var payee = decodedLogs[1];
				stashAddress[returnVal['negativelyAffected']] = payer.log.address;
				stashAddress[returnVal['positivelyAffected']] = payee.log.address;
				returnVal['events'] = [];
				returnVal['events'].push({ name: 'payment', args: payer.log.args, negativelyAffected:  returnVal['negativelyAffected'], contract: payer.contract, blockno: blockno, txnHash: txnHash, bankName: returnVal['negativelyAffected'], side: 'negative'});
				returnVal['events'].push({ name: 'received payment', args: payee.log.args, positivelyAffected:  returnVal['positivelyAffected'], contract: payee.contract, blockno: blockno, txnHash: txnHash, bankName: returnVal['positivelyAffected'], side: 'positive'});
			}
			break;
		default: 
			console.log("no processor defined.");
	}
	if (Array.isArray(returnVal['events'])) {
		var memo = "";
		if (inputs['_remarks']) memo = inputs['_remarks'];
		returnVal['events'].forEach(function(event) {
			event['memo'] = memo;
		});
	}
	return returnVal;
	
}

module.exports = {
	getWeb3: getWeb3,
	transactionAgentABI: taABI,
	transactionAgentAddr: taAddress,
	stashABI: stABI,
	getTransactionAgent: getTransactionAgent,
	getBanks: getBanks,
	createStash: createStash,
	pledgeStash: pledgeStash,
	acceptPledgeStash: acceptPledgeStash,
	initTransfer: initTransfer,
	getBankBalance: getBankBalance,
	getStash: getStash,
	getTransactionReceipt: getTransactionReceipt,
	parseReceipts: parseReceipts,
	getFunctionHashes: getFunctionHashes,
	findFunctionByHash: findFunctionByHash,
	getInputParams: getInputParams,
	blockProcessor: blockProcessor,
	functionCallProcessor: functionCallProcessor
}

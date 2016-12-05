// web3Helper
const Web3 = require('web3');
const utils = require('./utils');
const bcUtil = require('./bcUtil');
const p = require('./p');
const SolidityEvent = require("web3/lib/web3/event.js");
const SolidityCoder = require("web3/lib/solidity/coder.js");
const opt = require('../config.json');

//---service description
const providerURL = "http://" + opt.ethereum_httprpc_host;
const providerPort = opt.ethereum_httprpc_port.toString();

//---contract descriptions
var costForTA 			= opt.costForTA; 			
var costForStash 		= opt.costForStash;
var costForPledge 		= opt.costForPledge; 		
var costForAcceptPledge = opt.costForAcceptPledge;
var costForTransfer 	= opt.costForTransfer; 	
var taAddress = opt.transaction_agent_address;
var taABI = opt.transaction_agent_abi;
var stABI = opt.stash_abi;
var taOwner = opt.transaction_agent_owner;
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
		//var accounts = getWeb3().eth.accounts;
		banks = opt.banks;
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
	console.log('trying to create stash for '+ bankName + ' by ' + getBanks()[taOwner]);
	var txnHash = getTransactionAgent().createBankStash(bankName, getBanks()[bankName], txnNo++, {from: getBanks()[taOwner], gas: costForStash});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);	
}

//---using TransactionAgent to initiate pledge or redeem for a stash 
function pledgeStash(bankName, amt, memo, redeemFlag) {
	redeemFlag |= 0;
	var txnHash = getTransactionAgent().requestPledgeRedeem(bankName, amt, memo, redeemFlag, {from: getBanks()[bankName], gas: costForPledge});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---using TransactionAgent to accept pledge/redeeming for a stash 
function acceptPledgeStash(txnId, memo) {
	var txnHash = getTransactionAgent().acceptPledgeRedeem(txnId, memo, {from: getBanks()[taOwner], gas: costForAcceptPledge});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---using TransactionAgent to reject pledge/redeeming for a stash 
function rejectPledgeStash(txnId, memo) {
	var txnHash = getTransactionAgent().rejectPledge(txnId, memo, {from: getBanks()[taOwner], gas: costForAcceptPledge});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---using TransactionAgent to transfer between stashes 
function initTransfer(fromBank, toBank, amt, memo) {
	var txnHash = getTransactionAgent().initTransfer(fromBank, toBank, amt, memo, {from: getBanks()[fromBank], gas: costForTransfer});
	return bcUtil.getTransactionReceiptMined(getWeb3(), txnHash);
}

//---get banks' balance
function getBankBalance(bankNames) {
	if (Array.isArray(bankNames)) {
		var returnVal = {};
		var balance;
		bankNames.forEach(function(bankName) {
			balance = getTransactionAgent().getBalanceMAS.call(bankName, {from: getBanks()[taOwner] });
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
		console.log('contract class', contractClass, decoders);
		var filteredDecoders = decoders.find(function(decoder) {
            return (decoder.signature() == log.topics[0].replace("0x",""));
        }); 
		if (!filteredDecoders) return [contractClass, log];
        return [contractClass, filteredDecoders.decode(log)];
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
					expectFollowUp[decodedLogs[0].log.args['transactionId'].valueOf()] = {type: type, bankName: inputs['_destStashName'], txnHash, amount: returnVal.amount, status: 'pending'};	
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
		case 'rejectPledge':
		case 'acceptPledgeRedeem':
			handleAcceptReject(fnName, returnVal, inputs, decodedLogs);
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

function handleAcceptReject(fnName, returnVal, inputs, decodedLogs) {
	var txnNo = inputs['_transactionNum'].valueOf();
	var expecting = expectFollowUp[txnNo];
	var bankName, type, side='unknown';
	if (expecting) {
		type = fnName == 'acceptPledgeRedeem'?'accept ' + expecting.type:'reject '+ expecting.type;
		bankName = expecting.bankName;
		side = expecting.type == 'pledge'?'positivelyAffected':'negativelyAffected';
		returnVal[side] = bankName;
		returnVal.ind = fnName == 'acceptPledgeRedeem'?side.substring(0,8):'neutral';
		returnVal.bankName = bankName;
		expecting.status = fnName == 'acceptPledgeRedeem'?'accepted':'rejected';
	} else if (decodedLogs && decodedLogs.length > 1) {
		var stashOwner = stashAddress.getKeyByValue(decodedLogs[1].address);
		if (stashOwner) returnVal['bankName'] = stashOwner;
		type = 'accept pledge/Redeem';
	}
	if (type) 
		returnVal['fnName'] = type;
	else if (returnVal['fnName'] == 'rejectPledge') 
		returnVal['fnName'] = 'reject pledge/Redeem';
	if (Array.isArray(decodedLogs)) {
		if (bankName && !stashAddress[bankName] && decodedLogs.length > 1) stashAddress[bankName] = decodedLogs[1].log.address;
		var events = [];
		if (fnName == 'acceptPledgeRedeem') {
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
				event.blockno = returnVal.blockno;
				event.txnHash = returnVal.txnHash;
			});
			returnVal['events'] = events;
		} else {
			var rejection = decodedLogs[0];
			returnVal.amount = expecting? expecting.amount:null;
			events.push({ name: type, args: rejection.log.args, contract: rejection.contract});
			events.forEach(function(event) {
				if (side != 'unknown') { 
					event[side] = bankName;
				}
				event.side = returnVal.ind;
				event.bankName = bankName;
				event.blockno = returnVal.blockno;
				event.txnHash = returnVal.txnHash;
			});
			returnVal['events'] = events;
		}
	} 
	
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
	rejectPledgeStash: rejectPledgeStash,
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

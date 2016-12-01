//const util = require('util');
const p = require('./p');
const utils = require('./utils');
const sio = require('./sio');
const helper = require('./web3Helper');
const bcUtil = require('./bcUtil');

var abis = {};
var web3;

module.exports = {
	getBalances: function (web3) {
		var returnVal = [];
		var i = 0;
		web3.eth.accounts.forEach(function (e) {
			returnVal.push(" accounts[" + i + "]: " + e + ", bal: " + web3.fromWei(web3.eth.getBalance(e), "ether") + " eth.");
			i++;
		});
		return returnVal;
	},	
	getBlocksAndTxns: function (startBlockNumber, endBlockNumber, filters, callback) {
		if (!web3) web3 = helper.getWeb3();
		var self = this;
		var eventName = 'New Transactions';
		if (endBlockNumber == null) {
			endBlockNumber = web3.eth.blockNumber;
			console.log("Using endBlockNumber: " + endBlockNumber);
		}
		if (startBlockNumber == null) {
			startBlockNumber = 1000;
		}
		var startingAt = startBlockNumber;
		startBlockNumber = endBlockNumber < startingAt?0:endBlockNumber - startingAt;
		console.log("Using startBlockNumber: " + startBlockNumber);
		console.log("Searching for transactions within blocks " + startBlockNumber + " and " + endBlockNumber);
		var map = {event: eventName};		
		var accounts, contracts, unifiedView;
		if (endBlockNumber > 0) {
			for (var i = startBlockNumber+1; i <= endBlockNumber; i++) {
				console.log("Searching block " + i);
				var block = web3.eth.getBlock(i, true);
				var tHashes = [];
				if (block != null && block.transactions != null) {
					if (!map.blocks) map.blocks = [];
					
					block.transactions.forEach(function(txn) {	  
						tHashes.push(txn.hash);	
						var decodedLogs;
						filters.forEach(function(filter) {
							switch (filter) {
								case 'receipts': 
									decodedLogs = self.receiptFilter(txn.hash);
									break;
								case 'accounts': 
									if (!accounts) accounts = web3.eth.accounts;
									self.accountFilter(accounts, txn, map);
									break;
								case 'taContracts':
									if (!contracts) contracts = helper.transactionAgentAddr;
									self.taContractFilter(contracts, txn, map, decodedLogs);
									break;
								default: 
									console.log("Filter not recognized.");
							}
						});
					});
					block.transactions = tHashes;
					map.blocks.push(helper.blockProcessor(block));
				}
			}
		}
		if (map.blocks.length == 0) {
			return callback(null, map);
		}
		/*if (sio.isServerUp()) {
			var mon = sio.getNameSpace('mon');
			mon.emit(eventName, map);
		}*/
		return callback(null,map);
	},
	accountFilter: function(accounts, e, map) {
		if (accounts.indexOf(e.from) >= 0) {
			utils.addToMap(map, 'from', e.from, e);
		} 
		if (accounts.indexOf(e.to) >= 0) {
			utils.addToMap(map, 'to', e.to, e);
		}
	},
	taContractFilter: function(contracts, e, map, decodedLogs) {
		//console.log(contracts);
		
		var receipt = web3.eth.getTransactionReceipt(e.hash);
		var fnSignature;
		if (contracts==e.to) {
			if (e.input != null) {
				if (!abis['TransactionAgent']) {
					abis['TransactionAgent'] = helper.getFunctionHashes(helper.transactionAgentABI);
				}
				fnSignature = helper.findFunctionByHash(abis['TransactionAgent'], e.input);
			}
		} else {
			if (!abis['Stash']) {
				abis['Stash'] = helper.getFunctionHashes(helper.stashABI);
			}
			fnSignature = helper.findFunctionByHash(abis['Stash'], e.input); 
		}	
		//console.log(fnSignature);
		if (fnSignature != null) {
			var params = helper.getInputParams(fnSignature.inputs, fnSignature.inputTypes, e.input);
			var unifiedView = helper.functionCallProcessor(e.blockNumber, e.hash, fnSignature.name, params, decodedLogs);
			if (unifiedView) {
				utils.addToMap(map, 'txnView', e.blockNumber, unifiedView);							
			}
		}	
	},
	receiptFilter: function(txnHash) {
		var receipt = web3.eth.getTransactionReceipt(txnHash);
		var decodedLogs;
		if (receipt != null && receipt.logs != null && receipt.logs.length > 0) {
			//console.log(receipt.logs);
			decodedLogs = helper.parseReceipts(receipt.logs);
			//console.log(decodedLogs);
			decodedLogs = decodedLogs.map(function(log) {
				return {contract: log[0], log: log[1]};
			});
			return decodedLogs;
		}
		return null;
	}
	
}

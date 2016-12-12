const helper = require('./lib/web3Helper');
const bc = require('./lib/bc');
const bcUtil = require('./lib/bcUtil');
const p = require('./lib/p');
const async = require('async');
const blockGetter = require('./blockGetter');
var process = require('process');
const cp = require('child_process');

var web3 = helper.getWeb3();
var needToPrint = true;
var startFromBlock = 10;
var endBlock = 10719;//9935; // put the block number you want to see


var result;
var children = [];
// get banks and use to instantiate stash
var banks = helper.getBanks();
console.log(banks);

// watch for ta's events
//var taEvents = bcUtil.watchEvents(helper.getTransactionAgent());
/*
//-- testing - to be removed
Object.keys(banks).forEach(function(bankName) {
console.log('Stash: ' + helper.getStash(bankName));
});
var balances = helper.getBankBalance(Object.keys(banks));
console.log(balances);
//-- end of testing
 */
function printDecodedLogs() {
	var s = Date.now();
	return bc.getBlocksAndTxns(startFromBlock, endBlock, ["receipts", "taContracts"], function (error, response) {
		console.log('--taContract');
		console.log(p.pretty(response.blocks));
		console.log(p.pretty(response.txnView));
		e = Date.now();
		var diff = e - s;
		console.log('printDeco	dedLogs', diff);
		return response;
	});
}

//convenient method to get a number series array
function getSeries(from, to) {
	var returnVal = [];
	for (var i = from + 1; i <= to; i++) {
		returnVal.push(i);
	}
	console.log(returnVal);
	return returnVal;
}

//convenient method to get a number series array
function getSeriesOfSeries(from, to, num) {
	if (to-from < num) {
		num = to-from;
	}
	var returnVal = [];
	var end; 
	for (var j = 1; j <= num; j++) {
		var start = !end?1:end+1;
		end = start + ((to-from)/num) - 1;
		end = j == num?(to-from):end;
		console.log('start', start, 'end', end);
		var thisArr = [];
		for (var i = from + start; i <= from + end; i++) {
			thisArr.push(i);
		}
		returnVal.push(thisArr);
	}
	console.log(returnVal);
	return returnVal;
}

// Deprecated
function mapReduceDecodedLogs() {
	//async.
	if (!web3)
		web3 = helper.getWeb3();
	var self = this;
	var eventName = 'New Transactions';
	endBlockNumber = endBlock;
	startBlockNumber = startFromBlock;
	if (endBlockNumber == null) {
		endBlockNumber = web3.eth.blockNumber;
		console.log("Using endBlockNumber: " + endBlockNumber);
	}
	if (startBlockNumber == null) {
		startBlockNumber = 1000;
	}
	var startingAt = startBlockNumber;
	startBlockNumber = endBlockNumber < startingAt ? 0 : endBlockNumber - startingAt;
	console.log("Using startBlockNumber: " + startBlockNumber);
	console.log("Searching for transactions within blocks " + startBlockNumber + " and " + endBlockNumber);
	var map = {
		event: eventName
	};
	var accounts,
	contracts,
	unifiedView;
	if (endBlockNumber > 0) {
		map.blocks = [];
		map.txnView = {};

		//console.log('getSeries(startBlockNumber, endBlockNumber)', getSeries(startBlockNumber, endBlockNumber));
		async.each(getSeriesOfSeries(startBlockNumber, endBlockNumber, 4),
		function (blockno, callBack) {
			console.log('searching for ', blockno);
			for (var i = 0; i < blockno.length; i++) {
				console.log('searching for a ', blockno[i], web3);
				block = web3.eth.getBlock(blockno[i], true);
				var tHashes = [];
				if (Array.isArray(block.transactions)) {
					block.transactions.forEach(function (txn) {
						//console.log('txn.hash', txn);
						tHashes.push(txn.hash);
						decodedLogs = bc.receiptFilter(txn.hash);
						bc.taContractFilter(helper.transactionAgentAddr, txn, map, decodedLogs);
					});
				}
				block.transactions = tHashes;
				map.blocks.push(helper.blockProcessor(block));
			}
				callBack();
		}, function (err) {
			console.log('map', map);
			if (!err)
				return map;

		});
	}

}

// Deprecated
function mapReduceDecodedLogs1() {
	var start = Date.now();
	//async.
	if (!web3)
		web3 = helper.getWeb3();
	var self = this;
	var eventName = 'New Transactions';
	endBlockNumber = endBlock;
	startBlockNumber = startFromBlock;
	if (endBlockNumber == null) {
		endBlockNumber = web3.eth.blockNumber;
		console.log("Using endBlockNumber: " + endBlockNumber);
	}
	if (startBlockNumber == null) {
		startBlockNumber = 1000;
	}
	var startingAt = startBlockNumber;
	startBlockNumber = endBlockNumber < startingAt ? 0 : endBlockNumber - startingAt;
	console.log("Using startBlockNumber: " + startBlockNumber);
	console.log("Searching for transactions within blocks " + startBlockNumber + " and " + endBlockNumber);
	var map = {
		event: eventName
	};
	var accounts,
	contracts,
	unifiedView;
	if (endBlockNumber > 0) {
		map.blocks = [];
		map.txnView = {};

		//console.log('getSeries(startBlockNumber, endBlockNumber)', getSeries(startBlockNumber, endBlockNumber));
		async.each(getSeriesOfSeries(startBlockNumber, endBlockNumber, 4),
		function (blockno, callBack) {
			console.log('searching for ', blockno);
			var good = 0, called = false;
			for (var i = 0; i < blockno.length; i++) {
				block = web3.eth.getBlock(blockno[i], function(err, block) {
					if (!block) return;
					var tHashes = [];
					if (Array.isArray(block.transactions)) {
						block.transactions.forEach(function (txn) {
							//console.log('txn.hash', txn);
							tHashes.push(txn.hash);
							decodedLogs = bc.receiptFilter(txn.hash);
							bc.taContractFilter(helper.transactionAgentAddr, txn, map, decodedLogs);
						});
					}
					block.transactions = tHashes;
					map.blocks.push(helper.blockProcessor(block));
					good++;
				});
			}
		setInterval(function() {	if (good == blockno.length && !called) {
		called = true; callBack(); } }, 100);
		}, function (err) {
			console.log('final map', map);
			end = Date.now();
			var diff = end - start;
			console.log('mapReduceDecodedLogs', diff);
			return;

		});
	}

}

// Deprecated
function mapReduceDecodedLogs2() {
	var start = Date.now();
	//async.
	if (!web3)
		web3 = helper.getWeb3();
	var self = this;
	var eventName = 'New Transactions';
	endBlockNumber = endBlock;
	startBlockNumber = startFromBlock;
	if (endBlockNumber == null) {
		endBlockNumber = web3.eth.blockNumber;
		console.log("Using endBlockNumber: " + endBlockNumber);
	}
	if (startBlockNumber == null) {
		startBlockNumber = 1000;
	}
	var startingAt = startBlockNumber;
	startBlockNumber = endBlockNumber < startingAt ? 0 : endBlockNumber - startingAt;
	console.log("Using startBlockNumber: " + startBlockNumber);
	console.log("Searching for transactions within blocks " + startBlockNumber + " and " + endBlockNumber);
	var map = {
		event: eventName
	};
	var accounts,
	contracts,
	unifiedView;
	if (endBlockNumber > 0) {
		map.blocks = [];
		map.txnView = {};

		//console.log('getSeries(startBlockNumber, endBlockNumber)', getSeries(startBlockNumber, endBlockNumber));
		async.each(getSeries(startBlockNumber, endBlockNumber),
		function (blockno, callBack) {
			console.log('searching for ', blockno);
			//var good = 0, called = false;
			//for (var i = 0; i < blockno.length; i++) {
				block = web3.eth.getBlock(blockno, true, function(err, block) {
					//console.log('inside ', err.stack, block);
					if (!block) return;
					var tHashes = [];
					if (Array.isArray(block.transactions)) {
						block.transactions.forEach(function (txn) {
							//console.log('txn.hash', txn);
							tHashes.push(txn.hash);
							decodedLogs = bc.receiptFilter(txn.hash);
							bc.taContractFilter(helper.transactionAgentAddr, txn, map, decodedLogs);
						});
					}
					block.transactions = tHashes;
					map.blocks.push(helper.blockProcessor(block));
					callBack();
				});
			//}
		}, function (err) {
			console.log('final map', p.pretty(map));
			end = Date.now();
			var diff = end - start;
			console.log('mapReduceDecodedLogs', diff);
			return;

		});
	}

}

function mapReduceDecodedLogs3() {
	var start = Date.now();
	bc.asyncGetBlocksNTxns(startFromBlock, endBlock, function(map) {
		var end = Date.now();
		var diff = end-start;
		console.log('mapReduceDecodedLogs final: ', p.pretty(map));
		console.log('mapReduceDecodedLogs final: ', diff);
	});
}


function whipWorkers(result, startBlock, endBlock, filters, callBack) {
	var numBlocks = startBlock;
	var blocks = {},
	txnView = {},
	blocknos = [];
	// Fork workers.
	for (var i = 1; i <= numBlocks; i = i + 5) {
		console.log('master, iterate: ', numBlocks, 'i: ', i);
		child = cp.fork('./blockGetter_child.js');
		children.push(child);
		var ending = endBlock - numBlocks + i;
		ending = ending > endBlock ? endBlock : ending;
		child.send({
			startBlock: 5,
			endBlock: ending,
			filters: filters
		});
		child.on('message', (msg) => {
			blocks[msg.blockno] = msg.block;
			txnView[msg.blockno] = msg.txnView;
			blocknos.push(msg.blockno);
			if (blocknos.length == numBlocks) {
				blocknos = blocknos.sort();
				result = {
					txnView: txnView,
					blocks: []
				};
				blocknos.forEach(function (key) {
					result.blocks.push(blocks[key]);
				});
				children.forEach(function (child) {
					child.disconnect();
				});
				//console.log('blocknos.length', blocknos.length);
				//console.log('try1', result);
				callBack(result);
			}

		});
	}
}
/*try {
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var request = new XMLHttpRequest();
request.open('POST', encodeURI(decodeURI('http://localhost:8545')), true);
request.setRequestHeader('Content-Type','application/json');
payload = {"jsonrpc": "2.0",
 "id": 1,
 "method": "eth_getBlockByNumber",
 "params": [ "0x26cf", true ] };
 console.log(request.getRequestHeader());
request.send(JSON.stringify(payload));

} catch(err) {
	console.log(err.stack);
}*/
if (!needToPrint) {
	var start = Date.now();
	whipWorkers(result, startFromBlock, endBlock, ["receipts", "taContracts"], function (result) {
		console.log('try', result);
		end = Date.now();
		var diff = end - start;
		console.log('whipWorkers', diff);
	});
} else if (needToPrint) {
	//var start = Date.now();
	mapReduceDecodedLogs3();
	/*setInterval(function() {
		if (map.blocks && map.blocks.
	}, 200);*/
	//printDecodedLogs();
	/*end = Date.now();
	var diff = end - start;
	console.log('mapReduceDecodedLogs', diff);*/
	console.log('mapReduceDecodedLogs2');
} else {
	setTimeout(function () {
		//taEvents.stopWatching();
	}, 500);
}

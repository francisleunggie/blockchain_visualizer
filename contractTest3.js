const helper = require('./lib/web3Helper');
const bc = require('./lib/bc');
const bcUtil = require('./lib/bcUtil');
const p = require('./lib/p');
const async = require('async');

var web3 = helper.getWeb3();
var needToPrint = true;
var startFromBlock = 5;
var endBlock = 7183; // put the block number you want to see

// get banks and use to instantiate stash
var banks = helper.getBanks();
console.log(banks);

// watch for ta's events
var taEvents = bcUtil.watchEvents(helper.getTransactionAgent());
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
	
	return bc.getBlocksAndTxns(startFromBlock, endBlock, ["receipts","taContracts"], function(error, response) {
		console.log('--taContract');
		console.log(p.pretty(response.blocks));
		console.log(p.pretty(response.txnView));
		return response;
	});	
}

if (needToPrint) {
	printDecodedLogs();
} else {
	setTimeout(function () {
		taEvents.stopWatching();
	}, 500);
}



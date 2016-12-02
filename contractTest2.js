const helper = require('./lib/web3Helper');
const bcUtil = require('./lib/bcUtil');
const p = require('./lib/p');
const async = require('async');

var web3 = helper.getWeb3();
var needToTransfer = true;
var needToReset = false;

// get banks and use to instantiate stash
var banks = helper.getBanks();
console.log(banks);

// watch for ta's events
var taEvents = bcUtil.watchEvents(helper.getTransactionAgent());

//-- testing - to be removed
Object.keys(banks).forEach(function(bankName) {
	console.log('Stash: ' + helper.getStash(bankName));
});
var balances = helper.getBankBalance(Object.keys(banks));
console.log(balances);
//-- end of testing 


// create a stash 
function createStash(bankNo) {
	var bankName = Object.keys(banks)[bankNo];	
	console.log('creating stash for '+ bankName);
	helper.createStash(bankName)
	.then(function(receipt) {
		console.log(receipt);
	});
}

// pledge stash 
function pledgeBank(bankNo, amt, memo) {
	var bankName = Object.keys(banks)[bankNo];
	if (!memo) memo = 'Pledge '+ bankName;
	helper.pledgeStash(Object.keys(banks)[bankNo], amt, memo).then(function(receipt) {
		console.log(receipt);
	});
}

// reddem stash 
function redeemBank(bankNo, amt, memo) {
	var bankName = Object.keys(banks)[bankNo];
	if (!memo) memo = 'Redeem '+ bankName;
	helper.pledgeStash(Object.keys(banks)[bankNo], amt, memo, 1).then(function(receipt) {
		console.log(receipt);
	});
}

// accept pledge
function acceptPledge(txnId, memo) {
	if (!memo) memo = 'Accept Pledge/Redeem '+ txnId;
	helper.acceptPledgeStash(txnId, memo).then(function(receipt) {
		console.log(receipt);
	});
}

// transfer
function transfer(fromNo, toNo, amt, memo) {
	var fromBank = Object.keys(banks)[fromNo];
	var toBank = Object.keys(banks)[toNo];
	if (!memo) memo = 'Transfer from '+ fromBank + ' to ' + toBank;
	helper.initTransfer(fromBank, toBank, amt, memo).then(function(receipt) {
		console.log(receipt);
	});
}	

//convenient method to get a number series array
function getSeries(num, zeroMode) {
	if (num == 0) return [0];
	var returnVal = [];
	var start = 0;
	var limit = Object.keys(banks).length-1;
	if (zeroMode) {
		limit++;
		start++;
	}	
	for (var i = limit; i >= start; i--) {
		returnVal.push(num-i);
	}	
	console.log(returnVal);
	return returnVal;
}

if (needToTransfer) {
	transfer(6, 3, 9800000);
} else if (needToReset) {
	async.each(getSeries(8, false), 
		function(bankNo, callback) {
			//createStash(bankNo);
			//pledgeBank(bankNo, 100000000);
			//redeemBank(bankNo, 1112);
			acceptPledge(bankNo);
			callback();
		},
		function(err) {
			setTimeout(function () {
				taEvents.stopWatching();
			}, 500);
		}
	);
} else {
	setTimeout(function () {
		taEvents.stopWatching();
	}, 500);
}



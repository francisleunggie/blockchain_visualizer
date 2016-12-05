const helper = require('./lib/web3Helper');
const bcUtil = require('./lib/bcUtil');
const p = require('./lib/p');
const async = require('async');

var web3 = helper.getWeb3();
var banks = helper.getBanks();
var needToTransfer = true; // can change: action trigger switch for transfer
var paymap = {
	6: [3, 4, 5],
	0: [1, 2, 7],
	7: [0, 4, 6],
	1: [3, 5, 0],
	3: [1, 1, 2]
};
var amount = 1; // can change
var create = 0;			// can change: action trigger switches
var pledge = 0;         // can change: action trigger switches
var redeem = 0;         // can change: action trigger switches
var accept = 0;         // can change: action trigger switches
var reject = 0;         // can change: action trigger switches
var override = [36];	// can change: overrides getSeries
var txnID = 3;			// can change: when you accept / reject
var seriesEnd = accept+reject>0? txnID:Object.keys(banks).length,
	zeroMode = accept+reject>0?false:true;
var needToReset = (create + pledge + redeem + accept + reject)>0;


// get banks and use to instantiate stash
console.log(banks);

// watch for ta's events
var taEvents = bcUtil.watchEvents(helper.getTransactionAgent());

//-- testing - to be removed
/*Object.keys(banks).forEach(function(bankName) {
	console.log('Stash: ' + helper.getStash(bankName));
});*/
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

// redeem stash 
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

// reject pledge
function rejectPledge(txnId, memo) {
	if (!memo) memo = 'Accept Pledge/Redeem '+ txnId;
	helper.rejectPledgeStash(txnId, memo).then(function(receipt) {
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

var series = Array.isArray(override)? override : getSeries(seriesEnd, zeroMode); 

			//transfer(0, 1, 1);
if (needToTransfer) {
	Object.keys(paymap).forEach(function(payer) {
		payees = paymap[payer];
		payees.forEach(function(payee) {
			transfer(payer, payee, amount);
		});
	});
	
} else if (needToReset) {
	async.each( series,
		function(bankNo, callback) {
			if (create > 0) createStash(bankNo);
			if (pledge > 0) pledgeBank(bankNo, amount);
			if (redeem > 0) redeemBank(bankNo, amount);
			if (accept > 0) acceptPledge(bankNo);
			if (reject > 0) rejectPledge(bankNo);
			callback();
		},
		function(err) {
			setTimeout(function () {
			//	taEvents.stopWatching();
			}, 500);
		}
	);
} else {
	setTimeout(function () {
		//taEvents.stopWatching();
	}, 500);
}



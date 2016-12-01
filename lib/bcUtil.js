module.exports = {
	getTransactionReceiptMined : function (web3, txnHash, interval) {
		var transactionReceiptAsync;
		interval |= 500;
		transactionReceiptAsync = function(txnHash, resolve, reject) {
			try {
				var receipt = web3.eth.getTransactionReceipt(txnHash);
				if (receipt == null) {
					setTimeout(function () {
						transactionReceiptAsync(txnHash, resolve, reject);
					}, interval);
				} else {
					resolve(receipt);
				}
			} catch(e) {
				reject(e);
			}
		};
		return new Promise(function (resolve, reject) {
			transactionReceiptAsync(txnHash, resolve, reject);
		});
	}, 
	watchEvents : function(ta) {
		var events = ta.allEvents();
		events.watch(function(errors, event) {
			if (errors) {
				console.error("errors");
				console.error(errors);
			} else {
				console.log(event.event);
				console.log(event.args);
			}
		});
		return events;
	},
	
};
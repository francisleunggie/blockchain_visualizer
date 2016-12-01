web3.eth.sendTransaction({from:web3.eth.accounts[0], to: web3.eth.accounts[1], value: web3.toWei(1, "ether"), gasPrice: "1", gasLimit: "100000"});

var contract = eth.compile.solidity(source).<name of contract class>
MyContract = eth.contract(contract.info.abiDefinition);
acontract = MyContract.new({from: <my preferred account address>, data: contract.code}, <callback function below>);
function(e, c){ if(!e) { if(!c.address) { console.log("Contract transaction send: TransactionHash: " + c.transactionHash + " waiting to be mined..."); } else { console.log("Contract mined! Address: " + c.address); console.log(c); } } else { console.log("Error!!"); console.log(e); } } 
e.g.
	agreeter = greeterContract.new(_greeting, {from: eth.accounts[0], data: greeterCompiled.greeter.code, gas: 2000000, gasPrice: 20000}, function(e, c){ if(!e) { if(!c.address) { console.log("Contract transaction send: TransactionHash: " + c.transactionHash + " waiting to be mined..."); } else { console.log("Contract mined! Address: " + c.address); console.log(c); } } else { console.log("Error!!"); console.log(e); } } );

 --- first proper contract ---
 0x49f91ecf8c59254624dba3c9d817bb9564c2acbc
 --- mine the contract ---
acontract.<test function>.call(arg);
 --- save contract to json ---
contenthash = admin.saveInfo(contract.info, "contracts\\test.json");
 --- register contracts ---
admin.register(primaryAddress, acontract.address, contenthash);
admin.registerUrl(primaryAddress, contenthash, "http://lalalalala");

//-----------------use these
var taDef = web3.eth.contract([{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"addressOf","outputs":[{"name":"addr","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"register","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"unregister","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"nameOf","outputs":[{"name":"name","type":"bytes32"}],"payable":false,"type":"function"},{"inputs":[{"name":"_addr","type":"address"}],"type":"constructor"}]);
var ta = taDef.at('0x16e22ac90cf0811553a56ea971fac8d65b06401c');
ta.createBankStash('uob', web3.eth.accounts[1], {from: web3.eth.accounts[0], gasPrice: 0xffffffffff, gas: 0x47b760});


bcUtil.getTransactionReceiptMined(helper.getWeb3(), e.hash).then(function(receipt) {
			if (receipt != null && receipt.logs != null && receipt.logs.length > 0) {
				console.log(receipt.logs);
				var decodedLog = helper.parseReceipts(receipt.logs);
				console.log(decodedLog);
				utils.addToMap(map, 'contractEvents', 'assorted', decodedLog);
			}
		});








/*
					if (accounts == "*" || myaccount == e.from || myaccount == e.to) {
					console.log("  tx hash          : " + e.hash + "\n"
					+ "   nonce           : " + e.nonce + "\n"
					+ "   blockHash       : " + e.blockHash + "\n"
					+ "   blockNumber     : " + e.blockNumber + "\n"
					+ "   transactionIndex: " + e.transactionIndex + "\n"
					+ "   from            : " + e.from + "\n"
					+ "   to              : " + e.to + "\n"
					+ "   value           : " + e.value + "\n"
					+ "   time            : " + block.timestamp + " " + new Date(block.timestamp * 1000).toGMTString() + "\n"
					+ "   gasPrice        : " + e.gasPrice + "\n"
					+ "   gas             : " + e.gas + "\n"
					+ "   input           : " + e.input);
					}*/
					
getBlocks: function (web3, startBlockNumber, endBlockNumber) {
		if (endBlockNumber == null) {
			endBlockNumber = web3.eth.blockNumber;
			console.log("Using endBlockNumber: " + endBlockNumber);
		}
		if (startBlockNumber == null) {
			startBlockNumber = 1000;
		}
		var startingAt = startBlockNumber;
		startBlockNumber = endBlockNumber - startingAt;
		console.log("Using startBlockNumber: " + startBlockNumber);
		console.log("Searching for transactions within blocks " + startBlockNumber + " and " + endBlockNumber);
		var blocks = [];
		for (var i = endBlockNumber; i > startBlockNumber; i--) {
			console.log("Searching block " + i);
			var block = web3.eth.getBlock(i, true);
			if (block != null && block.transactions != null) {
				blocks.push(block);
			}
		}
		return blocks;
	},
	getTransactionsByAccount: function (web3, accounts, startBlockNumber, endBlockNumber, callback) {
		var blocks = this.getBlocks(web3, startBlockNumber, endBlockNumber);
		var map = {
			'from': {},
			'to': {}
		};
		if (blocks && blocks.length > 0) {
			blocks.forEach(function (block) {
				var i,
				e;
				for (i = 0; i < block.transactions.length; i++) {
					e = block.transactions[i];
					if (accounts.indexOf(e.from) > 0) {
						utils.addToMap(map, 'from', e.from, e);
					} 
					if (accounts.indexOf(e.to) > 0) {
						utils.addToMap(map, 'to', e.to, e);
					}
				}
			});

		} else {
			return callback(null);
		}
		return callback(null,map);
	}, 					
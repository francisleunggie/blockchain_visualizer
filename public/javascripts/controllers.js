angular.module('BlockchainMonApp.controllers', [])
	.controller('BlockchainController', function($scope,socket) {
		console.log('blockchain controller created!');
		$scope.description = "know what is happening in your blockchain";
		$scope.blocks = [], $scope.processedData = [], $scope.blockIndex = {}, $scope.events = {}, $scope.banks;
		
		socket.on('welcome', function (data) {
			console.log(data);
			socket.emit('private message', {
				clientHeight: 0
			});
		});
		
		socket.on('bankNames', function (data) {
			$scope.banks = data;
			console.log($scope.banks);
		});
		
		socket.on('bank balances', function (data) {
			console.log('new Balances');
			if (typeof data !== 'string') {
				console.log(data);
				$scope.balances = data;
			}
		});
		socket.on('New Transactions', function (data) {
			console.log("new transaction set", data);
			if (typeof data !== 'string') {
				updateData(data, $scope);
				console.log($scope.processedData);
			}
		});
		
		socket.on('height check', function () {
			console.log('height check');
			var currentHeight = 0;
			socket.emit('current height', {
				currentHeight: currentHeight
			});
		});
		
		$scope.selectBlock = function(blockno) {
			$scope.selectedBlock = blockno;
			console.log('selectedBlock', $scope.selectedBlock);
		};
		
		$scope.selectTxn = function(txnHash) {
			$scope.selectedTxn = txnHash;
			console.log('$scope.selectedTxn', $scope.selectedTxn);
		};
		
		$scope.switchEvent = function(bankName) {
			var idx = $scope.blockIndex[$scope.selectedBlock];
			var data = $scope.processedData[idx]; 
			data.activeEvent[bankName]++;
			data.activeEvent[bankName] %= data.events[bankName].length;
			console.log('currently selected', $scope.processedData[idx].activeEvent[bankName]);
		};
		
		$scope.getActiveEvent = function(bankName) {
			var idx = $scope.blockIndex[$scope.selectedBlock];
			var data = $scope.processedData[idx];
			var activeEvent = data.activeEvent[bankName];
			if (!data || data.events.lenght == 0) return [];
			return [data.events[bankName][activeEvent]];
		}
	});

function clone(obj, needToClone) {
	var returnVal = obj;
	if (needToClone > 0) returnVal = JSON.parse(JSON.stringify(obj));
	return returnVal;
}

function initArray(arr) {
	if (arr && arr.length > 0) return arr;
	return [];
}

function initArrayPerKey(keys, obj) {
	keys.forEach(function(key) {
		obj[key] = [];
	});
}
	
function updateData(newData, $scope) {
	console.log('update data', newData, $scope);
	if (!newData.blocks) return;
	$scope.processedData = []; // clear the array
	$scope.events = {}; // clear the array
	$scope.blockIndex = {}; // clear the array
	newData.blocks.forEach(function(block) {
		var newStruct = {blockno: block.blockNo, block : block, trxns : {}, events: {}, activeEvent: {}};
		initArrayPerKey($scope.banks, newStruct.events);
		initArrayPerKey($scope.banks, newStruct.trxns);
		var blockno = block.blockNo;
		var txns = newData.txnView[blockno];
		if (txns) {
				console.log("print here", blockno, txns);
			txns.forEach(function(txn) {
				console.log(blockno, txn);
				var needToClone = 0;
				var bank = txn.bankName;
				if (txn.ind == 'both') {
					['positive','negative'].forEach(function(side) {
						var catchPhrase = side+'lyAffected';
						if (txn[catchPhrase]) {
							var ttxn = clone(txn, needToClone);
							ttxn.ind = side;
							newStruct.trxns[txn[catchPhrase]].push(ttxn);
							needToClone++;
						} 
					});
				} else {
					var ttxn = txn;
					//ttxn.side = 'neutral'; // socket.io bug
					newStruct.trxns[bank].push(ttxn);
					needToClone++;	
				}
				if (txn.events) {
					txn.events.forEach(function(event) {
						var bank = event.bankName;
						newStruct.events[bank].push(event);
						newStruct.activeEvent[bank] = 0;
					});
				}
			});
		}
		
		$scope.processedData.push(newStruct);
	});
	$scope.processedData = $scope.processedData.reverse();
	$scope.processedData.forEach(function(data, index) {
		$scope.blockIndex[data.blockno] = index;
	});
	console.log('blockindex', $scope.blockIndex);
	$scope.selectedBlock = $scope.processedData[0].blockno;
}
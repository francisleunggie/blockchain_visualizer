angular.module('BlockchainMonApp.controllers', [])
	.controller('BlockchainController', function($scope,socket) {
		console.log('blockchain controller created!');
		$scope.description = "know what is happening in your blockchain";
		$scope.blocks = [], $scope.processedData = [], $scope.blockIndex = {}, $scope.events = {}, $scope.banks, $scope.skipEmpty=false;
		
		socket.on('welcome', function (data) {
			console.log(data);
			var currentHeight = 0;
			socket.emit('current height', {
				currentHeight: currentHeight
			});
		});
		
		socket.on('last block', function (data) {
			console.log(data);
			$scope.blockHeight = data.blockHeight;
			$scope.lastupdated = Date.now();
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
			//$('.event').qtip('destroy', true);
		};
		
		$scope.selectTxn = function(blockno, txnHash, bankName, counterparty) {
			$scope.selectedTxn = txnHash;
			$scope.selectedBlock = blockno;
			console.log('$scope.selectedTxn', $scope.selectedTxn);
			if (counterparty) {
				$scope.switchEventForTxn(txnHash, counterparty);
			}
			$scope.switchEventForTxn(txnHash, bankName);
		};
		
		$scope.switchEvent = function(bankName) {
			var idx = $scope.blockIndex[$scope.selectedBlock];
			var data = $scope.processedData[idx]; 
			data.activeEvent[bankName]++;
			data.activeEvent[bankName] %= data.events[bankName].length;
			console.log('currently selected', $scope.processedData[idx].activeEvent[bankName]);
		};
		
		$scope.getActiveEvent = function(bankName) {
			var data = $scope.processedData[$scope.blockIndex[$scope.selectedBlock]];
			var activeEvent = $scope.getActiveEventIdx(bankName);
			if (!data || data.events.lenght == 0) return [];
			return [data.events[bankName][activeEvent]];
		};
		
		$scope.getActiveEventIdx = function(bankName) {
			var idx = $scope.blockIndex[$scope.selectedBlock];
			var data = $scope.processedData[idx];
			return data.activeEvent[bankName];
		};
		
		$scope.switchEventForTxn = function(txnHash, bankName) {
			var idx = $scope.blockIndex[$scope.selectedBlock];
			var data = $scope.processedData[idx]; 
			if (data && data.events && data.events[bankName] && data.events[bankName].length > 0) {
				for (var i=0; i < data.events[bankName].length; i++) {
					event = data.events[bankName][i];
					if (event.txnHash == txnHash) {
						data.activeEvent[bankName] = i;
						break;
					}
				}				
			}
			console.log('currently selected', $scope.processedData[idx].activeEvent[bankName]);
		};
		
		$scope.switchTxn = function(blockno, bankName) {
			var idx = $scope.blockIndex[blockno];
			var data = $scope.processedData[idx]; 
			if (data.trxns[bankName].length == 1) return;
			data.activeTxn[bankName]++;
			console.log('switchTxn', 'bank',bankName,'block',blockno, 'activeTxn', data.activeTxn[bankName]);
			data.activeTxn[bankName] %= data.trxns[bankName].length;
			var selected = data.trxns[bankName][data.activeTxn[bankName]];
			var hash = selected.txnHash;
			var counterparty = selected.counterparty;
			$scope.selectTxn(blockno, hash, bankName, counterparty);
			$scope.switchEventForTxn(hash, bankName);
		};
		
		$scope.getActiveTxn = function(blockno, bankName) {
			if (!blockno) return [];
			var data = $scope.processedData[$scope.blockIndex[blockno]];
			var activeTxn = $scope.getActiveTxnIdx(blockno,bankName);
			if (!data || !data.trxns || data.trxns[bankName].lenght == 0) return [];
			console.log('getActiveTxn', 'bank',bankName,'block',blockno, 'activeTxn', activeTxn, data.trxns[bankName][activeTxn]);
			return [data.trxns[bankName][activeTxn]];
		};
		
		$scope.getActiveTxnIdx = function(blockno,bankName) {
			if (!blockno) return null;
			var idx = $scope.blockIndex[blockno];
			var data = $scope.processedData[idx];
			console.log('getActiveTxnIdx', 'bank',bankName,'block',blockno, 'activeTxn', idx, data.activeTxn);
			return data.activeTxn[bankName];
		};
		
		$scope.getSign = function(side) {
			if (side) {
				if (side == 'positive') return '+';
				if (side == 'negative') return '-';
			}
			return '';
		};
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
	newProcessedData = []; // clear the array
	newBlockIndex = {}; // clear the array
	newData.blocks.forEach(function(block) {
		if ($scope.blockIndex && $scope.blockIndex[block.blockNo] > -1) return;
		var newStruct = {blockno: block.blockNo, block : block, trxns : {}, events: {}, activeEvent: {}, activeTxn: {}};
		initArrayPerKey($scope.banks, newStruct.events);
		initArrayPerKey($scope.banks, newStruct.trxns);
		var blockno = block.blockNo;
		var txns = newData.txnView[blockno];
		if (Array.isArray(txns)) {
				txns.forEach(function(txn) {
				console.log(blockno, txn);
				var needToClone = 0;
				var bank = txn.bankName;
				txn.blockno = blockno;
				if (txn.ind == 'both') {
					['negative'].forEach(function(side) {
						var catchPhrase = side+'lyAffected';
						if (txn[catchPhrase]) {
							var ttxn = clone(txn, needToClone);
							ttxn.ind = side;
							if (txn.positivelyAffected) 
								ttxn.counterparty = txn.positivelyAffected;
							ttxn.bankName = txn[catchPhrase];
							newStruct.trxns[txn[catchPhrase]].push(ttxn);
							newStruct.activeTxn[txn[catchPhrase]] = 0;
							needToClone++;
						} 
					});
				} else {
					var ttxn = txn;
					//ttxn.side = 'neutral'; // socket.io bug
					if (ttxn && bank) newStruct.trxns[bank].push(ttxn);
					newStruct.activeTxn[bank] = 0;
					needToClone++;	
				}
				
				if (txn.events) {
					txn.events.forEach(function(event, idx) {
						var bank = event.bankName;
						if (event && bank) {
							newStruct.events[bank].push(event);
							newStruct.activeEvent[bank] = 0;
						}
					});
				}
			});
		}
		
		newProcessedData.push(newStruct);
	});
	// put oldest first, then add new data, and reverse again
	$scope.processedData = $scope.processedData.reverse();
	$scope.processedData = $scope.processedData.concat(newProcessedData);
	$scope.processedData = $scope.processedData.reverse();
	// only do this after merge
	$scope.processedData.forEach(function(data, index) {
		$scope.blockIndex[data.blockno] = index;
	});
	console.log('blockindex', $scope.blockIndex);
	if (!$scope.skipEmpty 
		|| $scope.processedData[0].block.transactions.length > 0) 
		$scope.selectedBlock = $scope.processedData[0].blockno;
}

/*function updateToolTip(selector) {
	$(selector+':visible').each( function( ) {
		var tooltip = $( this ).attr( 'tooltip' );
		//console.log('tooltip', tooltip);
		// the element has no rating tag or the rating tag is empty
		if ( tooltip == undefined || tooltip == '' ) {
			tooltip = 'no transaction hash available';
		} 

		// create the tooltip for the current element
		$( this ).each(function() {
			$(this).qtip( {
			content     : { text: tooltip, title: 'Transaction Hash'},
			overwrite: true,
			hide: {
				event: 'click, mouseout, mouseleave',
				target: $('[tooltip=\''+tooltip+'\']')
			}
			,
			position    : {
				adjust: {
					screen: true
				},
				target  : $( this ),
				my: 'top center',//$(this).hasClass('rightie')?'top right':'top left',
				at: 'bottom right',//$(this).hasClass('rightie')?'bottom left':'bottom right',
				resize: true
			},
			style       : { classes: 'qtip-tipsy qtip-shadow' },
			events : {
				render: function (event, api) {
					if ($(this).hasClass('txn')) {
						updateToolTip('.'+tooltip);
					}
				},
				hidden: function(event, api) {
					console.log(api.elements.target);
					//if ($(this).hasClass('event'))
						//api.destroy(true);
				}, 
				show: function(event, api) {
					console.log(api.elements.target);
					
				}
			}
			});
		} );
	} );
}*/
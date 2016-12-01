const JSON = require('JSON');
const helper = require('./lib/web3Helper');
const p = require('./lib/p');
const bc = require('./lib/bc');
const utils = require('./lib/utils');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const debug = require('debug')('init:server');
const async = require('async');

/****************| Start of ExpressJS rubbish |******************/
//---routes
var index = require('./routes/index');

//---declare express as the function handler
var app = express();

//---register middlewares
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
		extended: false
	}));
app.use(cookieParser());

//---view engine setup
app.set('views', path.join(__dirname, 'public')); // set view dir to public
app.use(express.static(path.join(__dirname, 'public'))); // set public path
app.engine('.html', require('ejs').renderFile); // render .html with ejs
app.set('view engine', 'html'); // set engine as html

//---handle routes
app.use('/', index);
//app.use('/mon', mon);
app.use(utils.handleNotFound);
app.use(utils.printStackTrace);

/****************| Start of socket.io |******************/
var sio = require('./lib/sio');
var io = sio.createIOServer(app);


var mon = sio.getNameSpace('mon'); // define namespace for monitoring
mon.on('connection', function (socket) {
	socket.emit('welcome', {
		msg: 'Connected to the blockchain x-ray viewer'
	});
	socket.on('private message', function (msg) {
		console.log('I received a private message: ', msg);
		if (latestBalances) socket.emit('bank balances', latestBalances);
		if (blocks)	socket.emit('height check', null);
		if (bankNames) socket.emit('bankNames', bankNames);
	});
	
	socket.on('refresh', function(msg) {
		console.log('refresh request: ', msg);
		socket.emit('bank balances', latestBalances);
		socket.emit('height check', null);
	});
	
	
	socket.on('current height', function(msg) {
		console.log('current height: ', msg);
		heightRequest--;
		if (heightRequest > 0) {
			return;
		} else if (heightRequest < 0) heightRequest = 0;
		if (blocks) {
			var end = blocks.length;
			var start = end > 25? blocks.length - 25:0;
			var newBlocks = blocks.slice(start, end), newTxnView = {};
			newBlocks.forEach(function(block) {
				newTxnView[block.blockNo] = txnView[block.blockNo];
			});
			/*var currentHeight = msg.currentHeight == 0?getBlocksEnd(blocks, false)-25:msg.currentHeight;
			var newBlocks = [], newTxnView = {};
			blocks.forEach(function(block) {
				if (block.blockNo > currentHeight) {
					newBlocks.push(block);
					newTxnView[block.blockNo] = txnView[block.blockNo];
				}
			});*/
			console.log("emitting", newBlocks, newTxnView);
			socket.emit('New Transactions', {blocks: newBlocks, txnView: newTxnView});
		}
		if (latestBalances) socket.emit('bank balances', latestBalances);
	});

	socket.on('disconnect', function () {
		sio.getNameSpace('').emit('user disconnected');
	});
});

/****************| Start of Web3 |******************/

//---service description
var web3 = helper.getWeb3();
var banks = helper.getBanks();
var bankNames = Object.keys(banks);

console.log("Connected: " + web3.currentProvider.host);

//---listing out all the accounts
console.log(p.pretty(web3.eth.accounts));

//---basic query balances
console.log(p.pretty(bc.getBalances(web3)));

//---Listen to events from a bank and from a contract
var numNewBlocks = -1;
var latestBlock;
var blocks, txnView;
var heightRequest = 0;
var latestBalances;
setInterval(function() {
	latestBlock = web3.eth.blockNumber;
	console.log('diff: ' + getDiffFromLatestBlocks(blocks, latestBlock));
	numNewBlocks = getDiffFromLatestBlocks(blocks, latestBlock);
	if (numNewBlocks <= 0) return;
	console.log('Blockchain Listener lifecycle: started');
	async.parallel({
		txns: function (callback) {
			bc.getBlocksAndTxns(numNewBlocks, latestBlock, ["receipts","taContracts"], callback);
		},
		bals: function (callback) {
			var balances = helper.getBankBalance(bankNames);
			var eventName = 'bank balances';
			mon.emit(eventName, balances);
			callback(null, {event: eventName, balances: balances});			
		}
	}, function (error, response) {
		Object.keys(response).forEach(function (key) {
			var data = response[key];
			var eventName = data.event;
			if (!data || data == null || Object.keys(data).length == 1) {
				console.error('error:', new Error("No " + eventName + " captured."));
				mon.emit(eventName, {
					'error': error
				});
			} else {
				console.log('result:');
				console.log(p.pretty(data));
				if (eventName == 'New Transactions') {
					if (!blocks || blocks.length == 0) {
						blocks = data.blocks;
						txnView = data.txnView;
					} else {
						lastHeight = getBlocksEnd(blocks, false);
						data.blocks.forEach(function(block) {
							if (block.blockNo > lastHeight) {
								blocks.push(block);
								txnView[block.blockNo] = data.txnView[block.blockNo];
							}
						});
					}
					
				} else if (eventName == 'bank balances') {
					latestBalances = data.balances;
				}				
				//console.log(blocks);
				mon.emit('height check', {request: heightRequest++});
			}
		});

		console.log('Blockchain Listener lifecycle: ended');
	});
}, 3000);

function getBlocksEnd(list, start) {
	var interested = 0;
	if (!start && list.length > 0) {
		interested = list.length - 1; 
	}
	return blocks[interested].blockNo;
}

function getDiffFromLatestBlocks(blocks, latestBlock) {
	if (!blocks || blocks.length == 0) return 25;
	console.log('last block: ' +getBlocksEnd(blocks, false));
	return latestBlock - getBlocksEnd(blocks, false);
}


//---Listen to the logs from a bank and from a contract


module.exports = app;

/****************| Start of socket.io |******************/
const utils = require('./utils');
const http = require('http');
var server,io;
var _socketPort = 2999;

var namespaces = {};

//--- create IO
function createIOServer(app) {
	if (!io || !server) {
		server = require('http').Server(app);
		io = require('socket.io')(server);
		server.listen(_socketPort);
		server.on('error', utils.onError);
		server.on('listening', (server) => utils.onListening);
	}
}

//--- retrieve NameSpace
function getNameSpace(name) {
	if (typeof name == 'string' && name == '') {
		return io;
	}
	if (!namespaces[name] || typeof namespaces[name] == 'undefined') {
		if (typeof name == 'string') {
			namespaces[name] = io.of('/'+name);
		}
	}
	return namespaces[name];
}

function isServerUp() {
	return typeof io !== 'undefined';
}

module.exports = {
	createIOServer: createIOServer,
	getNameSpace: getNameSpace,
	isServerUp: isServerUp
	
	
}
//const util = require('util');
const debug = require('debug')('init:server');
module.exports = {
	onError: function (error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string'
			 ? 'Pipe ' + port
			 : 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
		}
	},
	handleNotFound: function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	},
	printStackTrace: function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	},
	onListening: function (server) {
		var addr = server.address();
		var bind = typeof addr === 'string'
			 ? 'pipe ' + addr
			 : 'port ' + addr.port;
		debug('Listening on ' + bind);
	},
	addToMap: function (map, side, addr, e) {
		if (!map[side]) map[side] = {};
		if (!map[side][addr])
			map[side][addr] = [];
		map[side][addr].push(e);
	}

}

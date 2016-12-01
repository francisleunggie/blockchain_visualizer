const util = require('util');
module.exports = {
	pretty: function (obj) {
		return util.inspect(obj, {
			depth: null,
			colors: true
		});
	}
}

var mysql = require("mysql");
var util = require("util");
var conn = mysql.createConnection({
    "host":"bqq8j1e3akempdi7rh7v-mysql.services.clever-cloud.com",
    "user":"uiq8gbuk0azxqra2",
    "password":"2YzADWprnLEtfeGu0qRy",
    "database":"bqq8j1e3akempdi7rh7v"
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;

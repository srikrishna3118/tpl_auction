/**
 * Mongo connection utilities. Essentially a database model file.
 */

var config = require('../config');
var mongo = require('mongodb').MongoClient;

var conn = null;
module.exports = {
    "get": get,
    "clear": clear
};

function get (cb) {
    if (conn) {
        if (cb !== undefined)
            cb(null, conn);
        else
            return conn;
    }
    // connect to mongo
    mongo.connect(config.mongo.uri, function (err, db) {
        if (!err)
            conn = db;
        if (cb !== undefined)
            cb(err, db);
    });
}

function clear (req, res) {
    items = db.get().collection('items');
    var filter = {href: req.query.href};
    items.remove(filter, function (err, doc) {
        if (err)
            res.send(500);  // not found
        else
            res.send(200);
    });
}


/**
 * Mongo connection utilities. Essentially a database model file for players.
 */

const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.uri, { useNewUrlParser: true });

var players = null;

module.exports = {
    "get": get,
    "insert": insert,
    "clear": clear
};

client.connect(err => {
    players = client.db(config.mongo.dbname).collection(config.mongo.collectionname);
});

function get(options, cb) {
    players.find(options).toArray(function (err, result) {
        cb(err, result);
    });
}

function insert(doc, cb) {
    players.insert(doc, function (err, result) {
        cb(err, result);
    });
}


function clear(cb) {
    players.remove({}, function (err, result) {
        cb(err, result);
    });
}


/**
 * Essentially a configuration module. All static or dynamic configuration is linked here.
*/

exports.port = 8001;
exports.static = "./static";
exports.views = "./views";

exports.mongo = {
    //uri: "mongodb://localhost/catdemo", //uncomment for normal installation`
    uri: "mongodb://mongo:27017/catdemo",
    dbname:"catdemo",
    collectionname:"players"
};

exports.auth = {
    username: "",
    password: ""
};


/**
 * Essentially a configuration module. All static or dynamic configuration is linked here.
*/

exports.port = 8001;
exports.static = "./static";
exports.views = "./views";

exports.mongo = {
    uri: "mongodb://localhost/catdemo"
};

exports.auth = {
    username: "",
    password: ""
};


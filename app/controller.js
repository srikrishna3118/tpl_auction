/**
 * Application route resides here.
 */

const router = require("express").Router();

router.get("/", function (req, res) {
    res.send("Hi there!");
});

router.get("/player", require('./views/player.js').get);
router.get("/registered",require('./views/player.js').registered);
router.get("/api/initdb", require('./utils/init_db.js').get);

module.exports = router;
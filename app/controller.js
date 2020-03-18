/**
 * Application route resides here.
 */

const router = require("express").Router();

router.get("/", function (req, res) {
    res.send("Hi there!");
});

router.get("/player", require('./views/player.js').get);
router.get("/registered",require('./views/player.js').registered);
router.get("/auction",require('./views/player.js').auction);
router.get("/team",require('./views/player.js').team);
router.post("/sold",require('./views/player.js').sold);
router.post("/unsold",require('./views/player.js').unsold);

router.get("/api/initdb", require('./utils/init_db.js').get);

module.exports = router;

const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.uri, { useNewUrlParser: true });

var players= null;// = require('../models/player');

client.connect(err => {
    players = client.db(config.mongo.dbname).collection(config.mongo.collectionname);
});
exports.get = function(req, res) {
    const query = {};//{ projection:{_id: 0, name: 1}};//,{ projection: { _id: 0, name: 1 } }}";
    let data = [];

    res.render('auction', {data: {}});
    //TODO: Insert data here @srikrishna via DB.
};

exports.registered = function(req,res){
    players.find({},{ projection: {_id: 0, name: 1,specialization: 1}}).toArray(function(err, result) {
        if (err)
            res.send(500);
        else{
            console.log(result);
            let batsman =[];
            let bowler =[];
            let allrounder =[];
            let wk =[];
            result.forEach(row=>{
                console.log(row.name);
                if (row.specialization == "Bowler")
                    bowler.push(row.name.toLowerCase());
                if(row.specialization == "Batsman")
                    batsman.push(row.name.toLowerCase());
                if (row.specialization == "Allrounder")
                    allrounder.push(row.name.toLowerCase());
                if(row.specialization == "WicketKeeper")
                    wk.push(row.name.toLowerCase());
            });

            res.render('registered', {batsman: batsman, allrounder: allrounder, bowler: bowler, wk: wk});
        }
        //console.log(result);

    });
};
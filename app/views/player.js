
const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.uri, { useNewUrlParser: true });

var players= null;// = require('../models/player');


client.connect(err => {
    players = client.db(config.mongo.dbname).collection(config.mongo.collectionname);
});

function getStats(rating){
    var value=0;
    switch(rating) {
        case "beginners":
            // code block
            value = 20;
            break;
        case "expert":
            // code block
            value = 100;
            break;
        case "intermediate":
            value = 50;
            break;
        default:
            value = 10;
        // code block
    }
    return value;
}

exports.get = function(req, res) {
    const query = {};//{ projection:{_id: 0, name: 1}};//,{ projection: { _id: 0, name: 1 } }}";
    let data = [];

    res.render('auction', {data: {}});
    //TODO: Insert data here @srikrishna via DB.
};

//To display all the registered candidates
exports.registered = function(req,res){
    players.find({},{ projection: {_id: 0, name: 1,specialization: 1}}).toArray(function(err, result) {
        if (err)
            res.send(500);
        else{
            //console.log(result);
            let batsman =[];
            let bowler =[];
            let allrounder =[];
            let wk =[];
            result.forEach(row=>{
                //console.log(row.name);
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

function makefilter(req){
    console.log(req.query);
    var filter= {};
    if(req.query.bat=="on"){
        //console.log("selected batsman");
        filter = {specialization:"Batsman", sold: "unsold"};
    }
    else
        if(req.query.bowl=="on"){
            //console.log("selected bowler");
            filter = {specialization:"Bowler", sold: "unsold"};
        }
        else
            if(req.query.all=="on"){
                //console.log("selected all rounder");
                filter = {specialization:"Allrounder", sold: "unsold"};
            }
            else
                if(req.query.wk=="on"){
                    //console.log("selected wicketkeeper");
                    filter = {specialization:"WicketKeeper", sold: "unsold"};
                }
    return filter
}


exports.auction = function(req,res){
    //players.findOne({},function(err,result){
    var filter = makefilter(req);
    console.log(filter);
    players.find(filter).toArray(function(err,result){
        if (err)
            res.send(500);
        else {
            console.log(result);
            result = result.pop();
            if (result) {
                //console.log(result);
                var img = result.image.split("=");

                var out_img = "https://drive.google.com/thumbnail?id=";
                out_img = out_img.concat(img[1]);
                //console.log(out_img);

                res.render('auction', {
                    name: result.name,
                    spl: result.specialization,
                    bat: getStats(result.batting),
                    bowl: getStats(result.bowling),
                    field: getStats(result.fielding),
                    wk: getStats(result.keeping),
                    tag: result.tagline,
                    img: out_img
                })
            }else {
                res.render("empty",{spl: filter.specialization});
            }
        }
    });
};

exports.sold =function(req,res){
    //console.log(req.body);
    var filter={name:req.body.playername};
    players.findOne(filter,function(err,result){
        var newValue = result;
        newValue.sold=req.body.team;

        players.update(filter, newValue, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            //db.close();
        });
    });

    res.render('success',{player:req.body.playername, team: req.body.team, amt: req.body.price });

};

//To display all the registered candidates
exports.team = function(req,res){
    players.find({},{ projection: {_id: 0, name: 1,sold: 1}}).toArray(function(err, result) {
        if (err)
            res.send(500);
        else{
            //console.log(result);
            let team1 =[];
            let team2 =[];
            let team3 =[];
            let team4 =[];
            result.forEach(row=>{
                //console.log(row.name);
                if (row.sold == "heman")
                    team1.push(row.name.toLowerCase());
                if(row.sold == "batman")
                    team2.push(row.name.toLowerCase());
                if (row.sold == "superman")
                    team3.push(row.name.toLowerCase());
                if(row.sold == "ironman")
                    team4.push(row.name.toLowerCase());
            });

            res.render('teams', {t1: team1, t2: team2, t3: team3, t4: team4});
        }
        //console.log(result);

    });
};
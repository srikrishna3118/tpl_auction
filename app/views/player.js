
const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.uri, { useNewUrlParser: true });

var players= null;// = require('../models/player');


client.connect(err => {
    players = client.db(config.mongo.dbname).collection(config.mongo.collectionname);
});

function getStats(rating){
    var value=0;
    var r = rating.toLowerCase().split(" ").join("");
    //console.log("rating ",r);
    switch(r) {
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
            value = 0;
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
    //console.log(req.query);
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
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

exports.auction = function(req,res){
    //players.findOne({},function(err,result){
    var filter = makefilter(req);
    //console.log(filter);
    players.find(filter).toArray(function(err,result){
        if (err)
            res.send(500);
        else {
            //console.log("result length",result.length);
            var i = getRandomInt(result.length);
            console.log(result[i]);
            if(result.length === 1){
                result = result.pop();
            } else{
                result = result[i];
            }
            if (result) {
                //console.log(result);
                var img = result.image.split("=");

                var out_img = "https://drive.google.com/thumbnail?id=";
                //var out_img ="https://drive.google.com/file/d/"
                out_img = out_img.concat(img[1],"&sz=w320");
                console.log(out_img);

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
        newValue.price=req.body.price;

        console.log(newValue);

        players.update(filter, newValue, function(err, res) {
            if (err) throw err;
            console.log("one document updated");
            //db.close();
        });
    });

    res.render('success',{player:req.body.playername, team: req.body.team, amt: req.body.price });

};
function makeplayer(row){
    var player =row.name.toLowerCase();
    console.log(player);
    console.log(row.price);
    if(row.specialization === "Bowler"){
        player = player.concat("(O)","-",row.price);
    }
    if(row.specialization === "Batsman"){
        player = player.concat("(b)","-",row.price);
    }
    if(row.specialization === "Allrounder"){
        player = player.concat("(A)","-",row.price);
    }
    if(row.specialization === "WicketKeeper"){
        player = player.concat("(W)","-",row.price);
    }
    return player;
}

//To display all the registered candidates
exports.team = function(req,res){
    players.find({},{ projection: {_id: 0, name: 1,sold: 1,specialization:1, price:1}}).toArray(function(err, result) {
        if (err)
            res.send(500);
        else{
            var player;
            //console.log(result);
            let team1 =[];
            let team2 =[];
            let team3 =[];
            let team4 =[];
            let tp1=150;
            let tp2=150;
            let tp3=150;
            let tp4=150;
            result.forEach(row=>{
                //console.log(row.name);
                player = makeplayer(row);
                //console.log(player);
                if (row.sold === "heman") {
                    tp1 = tp1 - row.price;
                    team1.push(player);
                }
                if(row.sold === "batman"){
                    tp2=tp2-row.price;
                    team2.push(player);
                }
                if (row.sold === "superman"){
                    tp3=tp3-row.price;
                    team3.push(player);
                }
                if(row.sold === "ironman") {
                    tp4 = tp4 - row.price;
                    team4.push(player);
                }
            });

            res.render('teams', {t1: team1, t2: team2, t3: team3, t4: team4, p1: tp1, p2:tp2, p3:tp3,p4:tp4});
        }
        //console.log(result);

    });
};
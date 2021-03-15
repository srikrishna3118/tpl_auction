
const config = require('../../config');
const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(config.mongo.uri, { useNewUrlParser: true });

var players= null;// = require('../models/player');

const team_name = ["allagadda", "kakinada", "guntur", "guntur"];
const Bat = "Batsman"
const Bowl = "Bowler"
const Wk = "WicketKeeper"
const All = "Allrounder"

client.connect(err => {
    players = client.db(config.mongo.dbname).collection(config.mongo.collectionname);
});

function getStats(rating){
    var value;
    var r = rating.toLowerCase().split(" ").join("");
    //console.log("rating ",r);
    switch(r) {
        case "beginner":
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
    //const query = {};//{ projection:{_id: 0, name: 1}};//,{ projection: { _id: 0, name: 1 } }}";
    //let data = [];

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
                if (row.specialization === Bowl)
                    bowler.push(row.name.toLowerCase());
                if(row.specialization === Bat)
                    batsman.push(row.name.toLowerCase());
                if (row.specialization === All)
                    allrounder.push(row.name.toLowerCase());
                if(row.specialization === Wk)
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
    if(req.query.bat==="on"){
        //console.log("selected batsman");
        filter = {specialization:Bat, sold: "unsold",unsold: false};
    }
    else
        if(req.query.bowl==="on"){
            //console.log("selected bowler");
            filter = {specialization:Bowl, sold: "unsold",unsold: false};
        }
        else
            if(req.query.all==="on"){
                //console.log("selected all rounder");
                filter = {specialization:All, sold: "unsold",unsold: false};
            }
            else
                if(req.query.wk==="on"){
                    //console.log("selected wicketkeeper");
                    filter = {specialization:Wk, sold: "unsold",unsold: false};
                }
                else
                    if(req.query.us==="on"){
                        //console.log("selected wicketkeeper");
                        filter = {unsold: true};
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
            //console.log(result[i]);
            if(result.length === 1){
                result = result.pop();
            } else{
                result = result[i];
            }
            if (result) {
                //console.log(result);
                var img = result.image.split("=");

                //var out_img = "https://drive.google.com/thumbnail?id=";
                //out_img = out_img.concat(img[1],"&sz=w480");
                //console.log(out_img);
                var out_img = "/assets/images/players/";
                var out_img = out_img.concat(img[1],".jpg");
                //console.log(out_img);
                res.render('auction', {
                    name: result.name,
                    spl: result.specialization,
                    bat: getStats(result.batting),
                    bowl: getStats(result.bowling),
                    field: getStats(result.keeping),
                    wk: getStats(result.keeping),
                    tag: result.available,
                    quote: result.quote,
                    img: out_img
                })
            }else {
                res.render("empty",{spl: filter.specialization});
            }
        }
    });
};


exports.sold = function(req,res){
    //console.log(req.body);
    //console.log(req.body.teama);
    var filter={name:req.body.playername};
    players.findOne(filter,function(err,result){
        var newValue = result;
        if(req.body.team === "unsold"){
            newValue.unsold = true;
        }
        else{
            newValue.sold=req.body.team;
            newValue.price=req.body.price;
            newValue.unsold = false;
        }
        //console.log(newValue);

        players.update(filter, newValue, function(err, res) {
            if (err) throw err;
            console.log("one document updated");
            //db.close();
        });
    });
    var img = getRandomInt(4);
    console.log(img);
    res.render('success',{player:req.body.playername, team: req.body.team, amt: req.body.price, image: img });

};
function makeplayer(row){
    var player = {name: row.name.toLowerCase() , price: " ".concat(row.price,"Cr"), spl: ""};
        //row.name.toLowerCase();
    //console.log(player);
    //console.log(row.price);
    if(row.specialization === Bowl){
        player.spl = "/assets/images/icon_ball1.png";
    }
    if(row.specialization === Bat){
        //player = player.concat("(b)","-",row.price,"cr");
        player.spl = "/assets/images/icon_bat.png";
    }
    if(row.specialization === All){
        //player = player.concat("(a)","-",row.price,"cr");
        player.spl = "/assets/images/icon_all2.png";
    }
    if(row.specialization === Wk){
        //player = player.concat("(w)","-",row.price,"cr");
        player.spl = "/assets/images/icon_wk.png";
    }
    return player;
}

//To display all the purchased players
exports.team = function(req,res){
    players.find({},{ projection: {_id: 0, name: 1,sold: 1,specialization:1, price:1}}).toArray(function(err, result) {
        if (err)
            res.send(500);
        else{
            let cnt = result.length;
            var player;
            //console.log(result);
            let team1 =[];
            let team2 =[];
            let team3 =[];
            let team4 =[];
            let tp1=100;
            let tp2=100;
            let tp3=100;
            let tp4=100;
            result.forEach(row=>{
                //console.log(row.name);
                player = makeplayer(row);
                //console.log(player);
                if (row.sold.toLowerCase() === team_name[0]) {
                    tp1 = tp1 - row.price;
                    team1.push(player);
                }
                if(row.sold.toLowerCase() === team_name[1]){
                    tp2= tp2-row.price;
                    team2.push(player);
                }
                if (row.sold.toLowerCase() === team_name[2]){
                    tp3= tp3-row.price;
                    team3.push(player);
                }
                 if(row.sold.toLowerCase() === team_name[3]) {
                     tp4 = tp4 - row.price;
                     team4.push(player);
                 }

            });
            let baseprice = 4
            let maxplayers =12
            console.log(team1.length)
            let mp1 = tp1 - ((maxplayers-team1.length-1)*4)
            let mp2 = tp2 - ((maxplayers-team2.length-1)*4)
            let mp3 = tp3 - ((maxplayers-team3.length-1)*4)
            let mp4 = tp4 - ((maxplayers-team4.length-1)*4)
            console.log(team1.length)
            console.log(mp1,mp2,mp3,mp4)
            res.render('teams', {
                t1: team1,
                t2: team2,
                t3: team3,
                t4: team4,
                p1: tp1,
                p2:tp2,
                p3:tp3,
                p4:tp4,
                m1: mp1,
                m2: mp2,
                m3: mp3,
                m4:mp4
            });
        }
        //console.log(result);

    });
};
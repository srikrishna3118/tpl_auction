/** Copyright (c) 2013 Toby Jaffey <toby@1248.io>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

// var config = require('./config');
var players = require('../models/player');
var _ = require('underscore');

var fs = require('fs'),
    readline = require('readline'),
    {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly','https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly','https://www.googleapis.com/auth/drive.file'];
const TOKEN_PATH = 'token.json';


function sanitize(doc) {
    delete doc._id;
    return doc;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

exports.get = function (req, res) {
    // Authorization
    var data_1;
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        console.log("authorization function");
        data_1 = authorize(JSON.parse(content), datapull);
    });

    function datapull(auth) {
        const sheets = google.sheets({version: 'v4', auth});

        // Pulling the data from the specified spreadsheet and the specified range
        sheets.spreadsheets.values.get({
            // (1) Changed spreadsheet ID
            //spreadsheetId: '1BjYukL8TS4xtO4fw4J_R4O6HORRp-cEfJdjVDdT94kY',
            //spreadsheetId: '1TpUQKKkV3krBqikZBlfVANsIX2V__fhwRtM2d8GeASA',
            //spreadsheetId: '16y1Q5k5_WCpmJg2BeWHQavrmv7ALOhEoIGKtawixIQs',
            //spreadsheetId: '18fwdnmpizg6QoZ-E9Kuy1pRZI-6U_2XsPrFWLXwJhXQ',
            //spreadsheetId: '1UrRko7CDxSFgCIzVk5GA_R-xMtFtn1SOGkk31ZQh_Fg',
            spreadsheetId: '1Djnse9HyVT9N_v_Hkb3qsZh8zby4LVunkyBGNeWfi6g',
            // (2) Changed the range of data being pulled
            range: '2024!B2:X1000',
        }, (err, response) => {
            // (3) Checked for error messages
            if (err) return console.log('The API returned an error: ' + err);
            // (4) Clear out the database
            players.clear((err, result) => {
                let rows = response.data.values;
                let data = [];
                const drive = google.drive({version: 'v3', auth});
                rows.forEach (row => {
                    // let img_id = row[2].split("=");
                    // const path = fs.createWriteStream("./static/assets/images/players/"+img_id[1]+".jpeg");
                    // //console.log(path)
                    // path.on('finish', function () {
                    //     console.log('downloaded');
                    // });
                    // drive.files.get({ fileId: img_id[1], auth, alt: 'media'}, {responseType: 'stream'},
                    //     function(err, res){
                    //     if (err){
                    //         console.log('Error during download', err);
                    //         // return;
                    //     }
                    //         res.data
                    //             .on('end', () => {
                    //                 console.log('Done');
                    //             })
                    //             .on('error', err => {
                    //                 console.log('Error', err);
                    //             })
                    //         .pipe(path);
                    //     });
                    let record = {
                        "image":row[3],
                        "name":row[0],
                        //"dept":row[2],
                        // "batting":row[4],
                        // "batsman":row[5],
                        // "bowling":row[6],
                        // "bowler":row[7],
                        //"keeping":row[9],
                        //"fielding":row[14],
                        "specialization":row[4],
                        // "available":row[9],
                        //"quote":row[12],
                        "premimum":row[5],
                        "sold":"unsold",
                        "price":"0",
                        "unsold":false
                    };
                    //console.log(record)
                    data.push(record);
                });
                players.insert(data, (err, result) => {
                    if (err) throw err;
                    res.json({"status": "OK"});
                });
            });

        });
    }

};

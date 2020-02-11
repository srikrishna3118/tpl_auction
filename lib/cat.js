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

var config = require('./config');
var db = require('./mongo');
var _ = require('underscore');

var fs = require('fs'),
    readline =require('readline'),
    {google} = require('googleapis')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
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

exports.get = function(req, res) {
    // Authorization
    var data_1;
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        console.log("authorization function")
        data_1 = authorize(JSON.parse(content), datapull);
    });

    function datapull(auth) {
        const sheets = google.sheets({version: 'v4', auth});

        // Pulling the data from the specified spreadsheet and the specified range
        var result = sheets.spreadsheets.values.get({
            // (1) Changed spreadsheet ID
            spreadsheetId: '1BjYukL8TS4xtO4fw4J_R4O6HORRp-cEfJdjVDdT94kY',
            // (2) Changed the range of data being pulled
            range: 'sheet1!B2:M2',
        }, (err, response) => {
            if (err) return console.log('The API returned an error: ' + err);

            // (3) Setting data for daily tracking
            var rows = response.data.values;
            console.log("rows data is ",rows[0][6]);
            // (4) Rendering the page and passing the rows data in
            //return rows;
            //res.send(200, rows);
            //res.render('test', {rows: rows});
            res.render('auction', { name: rows[0][0],dept: rows[0][1], image: rows[0][6], spl: rows[0][7], batting: rows[0][8], bowling: rows[0][9],keeping: rows[0][10],fielding:rows[0][11]});
        });
    }
};


exports.delete = function(req, res) {
    items = db.get().collection('items');
    var filter = {href:req.query.href};
    items.remove(filter, function(err, doc) {
        if (err)
            res.send(500);  // not found
        else
            res.send(200);
    });
};

import fs from 'fs';
import readline from 'readline';
import google from 'googleapis';
import googleAuth from 'google-auth-library';

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

function auth(callback) {
  fs.readFile('client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      let error = 'Error loading client secret file: ' + err;
      console.log(error);
      callback(error);
    }
    authorize(JSON.parse(content), (auth) => {
      callback(auth);
    });
  });
}

// TODO: Uhh so is this callback hell yet?
// Load client secrets from a local file.
module.exports = {
  get: (sheet, callback) => {
    auth((auth) => getSheet(auth, sheet, (res) => {
      callback(res);
    }));
  },
  post: (sheet, values, callback) => {
    auth((auth) => postSheet(auth, sheet, values, (res) => {
      callback(res);
    }));
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client)
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
* GET sheet and return its values and log to server
*/
function getSheet(auth, sheet, callback) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: process.env.SPREADSHEET,
    range: sheet,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
      callback("Error");
    } else {
      console.log("Server: Sent `" + sheet + "` with " + rows.length + " rows");
      callback(rows);
    }
  });
}

/**
* POST to sheet and return its values and log to server
*/
function postSheet(auth, sheet, values, callback) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: process.env.SPREADSHEET,
    range: sheet,
    valueInputOption: 'USER_ENTERED',
    resource: values
  }, function(err, res) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = res.updates.updatedRows;
    if (typeof rows === 'undefined') {
      console.log('Server: Error in post request');
      callback("Error");
    } else {
      console.log("Server: Posted to `" + sheet + "` with " + rows + " rows");
      callback(rows);
    }
  });
}

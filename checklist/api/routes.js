import apicache from 'apicache'
import express from 'express';
import sheet from './spreadsheets';
import moment from 'moment';
const routes = express.Router();
let cache = apicache.middleware;

/* TODO: Modularize this, improve error handling to log console & give better messages
TODO: Also may need to catch spreadsheet call errors here..
*/

// Make sure CORS isnt blocked for API calls from client
routes.use((req, res, next) => { // TODO: Not sure if this is good practice? security-wise
  const origin = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_URL_PROD : process.env.REACT_APP_URL_DEV;
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header("Access-Control-Allow-Credentials", "true")
  next();
});

var lists = []; // Lists array. lists[i] returns name of list
var listTypes = []; // Types and list availability. types[i] returns array of available list IDs

// Populate type / list map
sheet.get("Types_Lists", (data) => {
  for (let i = 1; i < data.length; i++) {
    if (!isNaN(data[i][0])) { // Must be number validation
      listTypes[data[i][0]] = [];
      for (let j = 1; j < data[i].length; j++) {
        if (data[i][j] === "TRUE") {
          listTypes[data[i][0]].push(j);
        }
      }
    } else {
      console.log("Server: Error: Type ID in Types_Lists " + data[i][0] + " was not number!");
    }
  }
  console.log("Server: Types_Lists loaded:");
  console.log(listTypes);
});

sheet.get("Lists", (data) => { // Populate list / id map
   for (let i = 1; i < data.length; i++) {
     if (data[i].length < 2) {
       console.log("Server: Error: Lists call returned " + data[i].legnth + " columns, expected >= 2");
       res.status(500).send("Error!");
       return;
     }
     lists[data[i][0]] = data[i][1];
   }
   console.log("Server: Lists loaded:");
   console.log(lists);
});

// TODO: Maybe pre-populate users?

// GET / --> nothin
routes.get('/', cache('14 days'), (req, res) => {
  res.status(200).send("Checklist API");
});

// GET /list --> show lists
routes.get('/list', cache('7 days'), (req, res) => { // Unused for now
  var result = [];
  for (let i = 1; i < lists.length; i++) { // Uses List starting at 1 and incrementing...may not be reliable later
    result.push({"ID": i, "Name": lists[i]});
  }
  res.status(200).send(result);
});

// GET /list/# --> show items in that list
routes.get('/list/:listid', cache('5 days'), (req, res) => {
  sheet.get("Items", (items) => {
    sheet.get("Lists", (data) => {
      var result = [];
      var {listid} = req.params;
      var listFound = false;
      for (let i = 1; i < data.length; i++) {
       if (data[i].length < 2) {
         console.log("Server: Error: Lists call returned " + data[i].length + " columns, expected >=2");
         res.status(500).send("Server error");
         return;
       }
       if (data[i][0] == listid) {
         listFound = true;
         result.push({"ID": data[i][0], "Name": data[i][1], "Min_Pts": data[i][2]});
       }
      }
       if (listFound) {
         var listFoundInGroups = false;
         var groups = [];
         sheet.get("Groups", (data) => {
            for (let j = 1; j < data.length; j++) {
              if (data[j].length < 3) {
                console.log("Server: Error: Lists call returned " + data[j].legnth + " columns, expected >=3");
                res.status(500).send("Server error");
                return;
              }
              if (data[j][0] == listid) {
                let groupID = data[j][1];
                listFoundInGroups = true;
                groups[groupID] = {"ID": groupID, "Name": data[j][2], "Description": data[j][3], "Min_Pts": data[j][4], "Max_Pts": data[j][5], "Items": []};
                for (let k = 1; k < items.length; k++) {
                  if (items[k][0] === listid && items[k][2] === groupID) {
                    groups[groupID]["Items"].push({"ID": items[k][1], "Name": items[k][3], "Description": items[k][4], "Min": items[k][5], "Max": items[k][6], "Pts_Per": items[k][7]})
                  }
                }
              } else if (listFoundInGroups) {
                break; // Done, no longer that group in sheet.get.
              }
            }
            result[0]["Groups"] = groups;
            res.status(200).send(result);
          });
          return;
       } else {
         res.status(400).send({"error": "Bad request - List not found"});
       }
     });
  });
});

// GET /user/# --> get user's lists and type
routes.get('/user/:userid', cache('2 days'), (req, res) => {
  sheet.get("Users", (data) => {
     let userFound = false;
     let result = [];
     let {userid} = req.params;
     for (let i = 1; i < data.length; i++) {
       if (data[i].length < 3) {
         console.log("Server: Error: Lists call returned " + data[i].legnth + " columns, expected >=3");
         res.status(500).send("Server error");
         return;
       }
       if (data[i][0] == userid) {
         userFound = true;
         result.push({"ID": data[i][0], "Name": data[i][1], "Type": data[i][2], "Lists": listTypes[data[i][2]]});
         break;
       }
     }
     if (userFound) {
       res.status(200).send(result);
     } else {
       res.status(400).send({"error": "Bad request - User not found"});
     }
   });
});

// GET /user/#/list/# --> get user's list's data
routes.get('/user/:userid/list/:listid', cache('30 minutes'), (req, res) => {
  sheet.get("Users", (data) => {
     let userFound = false;
     let result = [];
     let {userid, listid} = req.params;
     req.apicacheGroup = userid;
     for (let i = 1; i < data.length; i++) {
       if (data[i].length < 3) {
         console.log("Server: Error: Users call returned " + data[i].length + " columns, expected >=3");
         res.status(500).send({"error": "Server error"});
         return;
       }
       if (data[i][0] == userid) {
         userFound = true;
         break;
       }
     }
     if (userFound) {
       sheet.get("Entries", (data) => {
          let userListFound = false;
          // For now, just traverse from top to bottom and assume that it will replace
          // User ID | Entry List | Entry Item | Entry Approved | Entry Qty | Date
          for (let j = 1; j < data.length; j++ ) {
            if (data[j][0] == userid && data[j][1] == listid) {
              userListFound = true;
              let approval = (data[j][4] == "TRUE") ? "Approved" : "Unapproved";
              if (!result[data[j][2]]) {
                result[data[j][2]] = {}
              }
              result[data[j][2]][approval + " Qty"] = data[j][3];
              result[data[j][2]][approval + " Date"] = data[j][5];
            }
          }
          res.status(200).send(result); // If empty, there are no entries to be found
       });
     } else {
       res.status(400).send({"error": "Bad request - User / list not found"});
     }
   });
});

// TODO: Figure out way to get rid of past entries saves. To reduce space.
// TODO: Deal with non-approved too.
// TODO: Improved validation? & throttle
// POST /user/#/list/# --> post new entry to user's list
routes.post('/user/:userid/list/:listid', (req, res) => {
  let {userid, listid} = req.params;
  let values = [];
  let entries = req.body;
  let i = 0;
  if (entries) {
    for (let key in entries) {
      if (entries.hasOwnProperty(key)) {
        if (isNaN(key) || key <= 0 || key != parseInt(key, 10) ||
            isNaN(entries[key]) || entries[key] < 0 || entries[key] != parseInt(entries[key], 10)) {
          res.status(400).send({"error": "Bad request - posted entries were not of numbers"})
          return; // TODO: Ugly
        }
        values[i] = [userid, listid, key, entries[key], "FALSE", moment().format("M/D/YYYY")];
        i++;
      }
    }
    sheet.post("Entries", {"values": values}, (rows) => {
      if (rows == "Error") {
        res.status(400).send({"error": "Server error"}); // TODO: Prob better error handling
      } else {
        res.status(200).send({"Updated_Rows": rows});
        apicache.clear(userid); // Clear cache of user
      }
    });
  } else {
    res.status(200).send({"Updated_Rows": 0});
  }
});

module.exports = routes;

import apicache from 'apicache'
import express from 'express';
import spreadsheet from './spreadsheets';
import moment from 'moment';
const routes = express.Router();
let cache = apicache.middleware;

/* TODO: Modularize this */

// Make sure CORS isnt blocked for API calls from client
routes.use((req, res, next) => { // TODO: Not sure if this is good practice?
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
spreadsheet("Types_Lists", (data) => {
  for (let i = 1; i < data.length; i++) {
    if (!isNaN(data[i][0])) { // Must be number validation
      listTypes[data[i][0]] = [];
      for (let j = 1; j < data[i].length; j++) {
        if (data[i][j] === "TRUE") {
          listTypes[data[i][0]].push(j);
        }
      }
    } else {
      console.log("Error: Type ID in Types_Lists " + data[i][0] + " was not number!");
    }
  }
  console.log("Types_Lists loaded:");
  console.log(listTypes);
});

spreadsheet("Lists", (data) => { // Populate list / id map
   for (let i = 1; i < data.length; i++) {
     if (data[i].length < 2) {
       console.log("Error: Lists call returned " + data[i].legnth + " columns, expected >= 2");
       res.status(500).send("Error!");
       return;
     }
     lists[data[i][0]] = data[i][1];
   }
   console.log("Lists loaded:");
   console.log(lists);
});

// / --> nothin
routes.get('/', cache('7 days'), (req, res) => {
  res.status(200).send("Checklist API");
});

// /list --> show lists
routes.get('/list', cache('1 day'), (req, res) => { // Unused for now
  var result = [];
  for (let i = 1; i < lists.length; i++) { // Uses List starting at 1 and incrementing...may not be reliable later
    result.push({"ID": i, "Name": lists[i]});
  }
  res.status(200).send(result);
});

// /list/# --> show items in that list
routes.get('/list/:listid', cache('1 day'), (req, res) => {
  spreadsheet("Items", (items) => {
    spreadsheet("Lists", (data) => {
      var result = [];
      var {listid} = req.params;
      var listFound = false;
      for (let i = 1; i < data.length; i++) {
       if (data[i].length < 2) {
         console.log("Error: Lists call returned " + data[i].length + " columns, expected >=2");
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
         spreadsheet("Groups", (data) => {
            for (let j = 1; j < data.length; j++) {
              if (data[j].length < 3) {
                console.log("Error: Lists call returned " + data[j].legnth + " columns, expected >=3");
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
                break; // Done, no longer that group in spreadsheet.
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

// /user/# --> get user's lists and type
routes.get('/user/:userid', cache('1 day'), (req, res) => {
  spreadsheet("Users", (data) => {
     let userFound = false;
     let result = [];
     let {userid} = req.params;
     for (let i = 1; i < data.length; i++) {
       if (data[i].length < 3) {
         console.log("Error: Lists call returned " + data[i].legnth + " columns, expected >=3");
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

// /user/#/list/# --> get user's list's data
routes.get('/user/:userid/list/:listid', cache('10 minutes'), (req, res) => {
  spreadsheet("Users", (data) => {
     let userFound = false;
     let result = [];
     let {userid} = req.params;
     let {listid} = req.params;
     for (let i = 1; i < data.length; i++) {
       if (data[i].length < 3) {
         console.log("Error: Lists call returned " + data[i].legnth + " columns, expected >=3");
         res.status(500).send("Server error");
         return;
       }
       if (data[i][0] == userid) {
         userFound = true;
         break;
       }
     }
     if (userFound) {
       spreadsheet("Entries", (data) => {
          let userListFound = false;
          // For now, just traverse from top to bottom and assume that it will replace
          // User ID | Entry List | Entry Item | Entry Approved | Entry Qty | Date
          for (let j = 1; j < data.length; j++ ) {
            if (data[j][0] == userid && data[j][1] == listid) {
              userListFound = true;
              let approval = (data[j][3] == "TRUE") ? "Approved" : "Unapproved";
              if (!result[data[j][2]]) {
                result[data[j][2]] = {}
              }
              result[data[j][2]][approval + " Qty"] = data[j][4];
              result[data[j][2]][approval + " Date"] = data[j][5];
            }
          }
          if (userListFound) {
            res.status(200).send(result);
          } else {
            res.status(400).send({"error": "Bad request - User / list not found"});
          }
       });
     } else {
       res.status(400).send({"error": "Bad request - User / list not found"});
     }
   });
});

module.exports = routes;

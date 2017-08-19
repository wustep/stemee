import apicache from 'apicache'
import express from 'express';
import spreadsheet from './spreadsheets';

const routes = express.Router();
let cache = apicache.middleware;

// TODO: Better error handling

var types = []; // Types and list availability. types[i] returns array of available list IDs
var lists = []; // Lists array. lists[i] returns name of list

spreadsheet("Types_Lists", (data) => { // Populate type / list map
  for (let i = 1; i < data.length; i++) {
    if (!isNaN(data[i][0])) { // Must be number validation
      types[data[i][0]] = [];
      for (let j = 1; j < data[i].length; j++) {
        if (data[i][j] === "TRUE") {
          types[data[i][0]].push(j);
        }
      }
    } else {
      console.log("Error: Type ID in Types_Lists " + data[i][0] + " was not number!");
    }
  }
  console.log("Types_Lists loaded:");
  console.log(types);
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

routes.get('/', cache('7 days'), (req, res) => {
  res.status(200).send("Checklist API");
});

routes.get('/list', cache('1 day'), (req, res) => { // Unused for now
  var result = [];
  for (let i = 1; i < lists.length; i++) { // Uses List starting at 1 and incrementing...may not be reliable later
    result.push({"ID": i, "Name": lists[i]});
  }
  res.status(200).send(result);
});

routes.get('/list/:listid', cache('1 day'), (req, res) => {
  var result = [];
  var {listid} = req.params;
  var listFound = false;
  spreadsheet("Lists", (data) => {
      console.log(data);
      for (let i = 1; i < data.length; i++) {
       if (data[i].length < 2) {
         console.log("Error: Lists call returned " + data[i].length + " columns, expected >=2");
         res.status(500).send("Server error");
         return;
       }
       if (data[i][0] == listid) {
         listFound = true;
         result.push({"ID": data[i][0], "Name": data[i][1]});
       }
     }
     if (listFound) {
       var listFoundInGroups = false;
       var groups = [];
       spreadsheet("Groups", (data) => {
         console.log(data);
          for (let j = 1; j < data.length; j++) {
            if (data[j].length < 3) {
              console.log("Error: Lists call returned " + data[j].legnth + " columns, expected >=3");
              res.status(500).send("Server error");
              return;
            }
            if (data[j][0] == listid) {
              let groupID = data[j][1];
              listFoundInGroups = true;
              groups[groupID] = {"ID": groupID, "Name": data[j][2], "Description": data[j][3], "Min_Pts": data[j][4], "Max_Pts:": data[j][5]};
            } else if (listFoundInGroups) {
              break; // Done, no longer that group in spreadsheet.
            }
          }
          result[0]["Groups"] = groups;
          res.status(200).send(result);
        });
        return;
     } else {
       res.status(400).send("Bad request - List not found");
     }
   });
});

routes.get('/user/:userid', cache('1 day'), (req, res) => {
  spreadsheet("Users", (data) => {
     let userFound = false;
     let result = [];
     let userID = 0;
     for (let i = 1; i < data.length; i++) {
       if (data[i].length < 3) {
         console.log("Error: Lists call returned " + data[i].legnth + " columns, expected >=3");
         res.status(500).send("Server error");
         return;
       }
       if (data[i][0] == listid) {
         userID = data[i][0];
         userFound = true;
         user.push({"ID": data[i][0], "Name": data[i][1], "Type": data[i][2]});
         break;
       }
     }
     res.status(200).send(result);
   });
});

routes.get('/user/:userid/list/:listid', cache('10 minutes'), (req, res) => {

});

module.exports = routes;

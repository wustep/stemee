import apicache from 'apicache'
import express from 'express';
import spreadsheet from './spreadsheets';

const routes = express.Router();
let cache = apicache.middleware;

// TODO: Add API Cache Middleware

routes.get('/', cache('7 days'), (req, res) => {
  res.status(200).send("Checklist API");
});

routes.get('/list', cache('1 day'), (req, res) => { // TODO: Better error handling.
  spreadsheet("Lists", (data) => {
     var result = [];
     for (let i = 1; i < data.length; i++) {
       if (data[i].length !== 2) {
         console.log("Error: Lists call returned " + data[i].legnth + " columns instead of 2");
         res.status(500).send("Error!");
         return;
       }
       result.push({"ID": data[i][0], "Name": data[i][1]});
     }
     res.status(200).send(result);
  });
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

});

routes.get('/user/:userid/list/:listid', cache('10 minutes'), (req, res) => {

});

module.exports = routes;

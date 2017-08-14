## API Routes

TODO:
```
GET /list/ : Get all lists available (Unused for now)
GET /list/# : Get all items and groups of list #
GET /user/# : Get user info (valid or not valid, user level, lists available)
GET /user/#/list/# : Get user info for list # and user #
POST set /user/#/list/# : Post changes to list # for user #
POST approve /user/#/list/# : Post approved changes to list # for user #, requires admin
```

Add?

### GET /list/
Returns array of List ID and Names in order of spreadsheet

Sample response:
```
{
  {
    "ID": 1
    "Name": "First Year Requirements (2017-18)"
  }
  {
    "ID": 2
    "Name": "Second Year Requirements (2017-18)"
  }
}
```

### GET /list/#
Returns list ID Name, Groups, and Items of those Groups.
Groups and Items are in order of the spreadsheet, top to bottom (NOT ID)

Sample response:
```
{
  {
    "ID": 1
    "Name": "First Year Requirements (2017-18)"
    "Groups:" {
      (0) {
        "Name": "Seminar"
        "ID": 1
        "Description": ""
        "Min Pts": 20
        "Max Pts": 20
        "Items: " {
          (0) {
            "ID": 1
            "Name": "Complete Seminar"
            "Min": 1
            "Max": 1
            "Pts Per": 20
          }
          ....
        }
      },
      (2) {
        "Name": "Events"
        "Description": "Must log on Event Logging Form"
        "Min Pts": 32
      }
      ...

    }
  }
}
```

Sample error:
```
{
  "ID": 123
  "error": "Invalid list ID."
}
```

### GET /user/#/
Returns user ID, name, type, and lists in order of spreadsheet list

Sample response:
```
{
  "ID": 121123123
  "Name": "Stephen Wu"
  "User Type": 0
  "Lists": {
    (0) {
      "Name": "First Year Requirements (2017-18)"
      "ID": 1
    }
    (1) {
      "Name": "Second Year Requirements (2017-18)"
      "ID": 2
    }
  }
}
```

Sample error:
```
{
  "ID": 123123123
  "error": "Invalid user ID."
}
```

### GET /user/#/list/#

Sample response:

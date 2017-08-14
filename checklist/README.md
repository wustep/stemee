# Checklist

This app was built by Stephen Wu to facilitate program requirements for the [STEM Exploration & Engagement Scholars Program](https://u.osu.edu/stemeescholars/). Checklist uses Google Spreadsheets to read and store program requirements and progress for users in any organization.

## Tech

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app). Checklist was written in NodeJS, using React and other packages and the [Google Spreadsheets v4 API](https://developers.google.com/sheets/api/).

## Usage

Create .env file with the following variables (without comments):
```
PORT=3000           # Port to use for client & server in production, or just client in development
SERVER_PORT=3000    # Port to use for server in development
```

With node & npm installed, run 'npm build' and then 'npm start' for production or 'npm run server' and 'npm run client' separately for development.

Full commands list ("npm run [command]")
```
go: build & start for production
build: builds and serves client and server files for production
start: serves built client and server files for production
start-test: serves built client and starts server for development with nodemon

server: starts server for development with nodemon
client: starts client for development with webpack-dev-server
server-build: builds client for production to /server/
client-build: builds client for production to /build/
client-test: runs react testing script
```

See API.md for more info on API routes.

## Contact

- Stephen Wu - STEM EE Scholars Consultant - wu.2719@osu.edu
- Jorge Eduardo Mendoza - STEM EE Scholars Coordinator - mendoza.773@osu.edu

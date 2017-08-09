const express = require('express');
const routes = express.Router();

// TODO: Add API Cache Middleware

routes.get('*', (req, res) => {
  res.status(200).send("API");
});

module.exports = routes;

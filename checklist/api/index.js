import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';

import routes from './routes';

require('dotenv').config()
const app = express();

// Pick SERVER_PORT if NODE_ENV is "development", otherwise, pick PORT, otherwise, pick 3000
console.log(`Server: ${process.env.NODE_ENV}`);
const port = (process.env.NODE_ENV == 'development') ? process.env.SERVER_PORT : (process.env.PORT ? process.env.PORT : 3010);

app.use(bodyParser.json()); // support json encoded bodies
app.use('/api', routes);

// TODO: properly send 404 -- not fixed by commit (oops) - https://reacttraining.com/react-router/web/guides/server-rendering
if (process.env.NODE_ENV == 'production') {
  console.log('Server: Serving static assets in production');
  console.log(`Server: Client assets on port ${port}`);
  app.use(express.static(path.join(__dirname + "/../", 'build')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + "/../", 'build', 'index.html'));
  });
}
app.listen(port, () => {
  console.log(`Server: Started on port ${port}`)
});

import express from 'express';
import path from 'path';

import routes from './routes';
require('dotenv').config()
const app = express();

// Pick SERVER_PORT if NODE_ENV is "development", otherwise, pick PORT, otherwise, pick 3000
const port = (process.env.NODE_ENV == 'development') ? process.env.SERVER_PORT : (process.env.PORT ? process.env.PORT : 3000);

// TODO: properly send 404 -- not fixed by commit (oops) - https://reacttraining.com/react-router/web/guides/server-rendering
if (process.env.NODE_ENV == 'production') {
	console.log('Server: Serving static assets in production');
	console.log(`Server: Client assets on port ${port}`);
	app.use('/', express.static('././build'));
}
app.use('/api', routes);

app.listen(port, () => {
	console.log(`Server: Started on port ${port}`)
});

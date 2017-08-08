import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import UserSelect from "./components/UserSelect";
import ListSelect from "./components/ListSelect";
import List from "./components/List";
import NotFound from './components/NotFound';

import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <BrowserRouter>
    <App>
      <Switch>
        <Route exact path="/user/:user" component={ListSelect} />
        <Route exact path="/user/:user/list/:list" component={List} />
        <Route exact path="/" component={UserSelect} />
        <Route path="*" component={NotFound} status={404} />
      </Switch>
    </App>
  </BrowserRouter>,
  document.getElementById('root')
);

registerServiceWorker();

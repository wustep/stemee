import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import UserSelect from "./components/UserSelect";
import ListSelect from "./components/ListSelect";
import List from "./components/List";
import NotFound from './components/NotFound';

import './index.css';
import withTracker from './withTracker';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <BrowserRouter>
    <App>
      <Switch>
        <Route exact path="/user/:user" component={withTracker(ListSelect)} />
        <Route exact path="/user/:user/list/:list" component={withTracker(List)} />
        <Route exact path="/" component={withTracker(UserSelect)} />
        <Route path="*" component={withTracker(NotFound)} status={404} />
      </Switch>
    </App>
  </BrowserRouter>,
  document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production') {
  registerServiceWorker();
}

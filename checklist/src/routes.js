import React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import App from './components/App';
import NotFound from './components/NotFound';

const Routes = (props) => (
  <BrowserRouter {...props}>
    <Switch>
      <Route exact path="/" component={App} />
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>
);

export default Routes;

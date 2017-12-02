import * as React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

import Index from '../views/Index';

export default class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path='/' exact={true} component={Index} />
        </Switch>
      </BrowserRouter>
    )
  }
}

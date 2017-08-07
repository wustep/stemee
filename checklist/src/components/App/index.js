import React, { Component } from 'react';

import logo from './logo.svg';
import './style.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>STEM EE Checklist</h2>
        </div>
        {this.props.children}
      </div>
    );
  }
}

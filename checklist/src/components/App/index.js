import React, { Component } from 'react';

import logo from './logo.svg';
import './style.css';

import UserSelect from "../UserSelect";

class AppBody extends Component {
  render() {
		let userId = 0;
		let form = <UserSelect />;

		if (userId) {
			form = <p>Logged in!</p>
		}
		return (
			<div>
				{form}
			</div>
		);
	}
}

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>STEM EE Checklist</h2>
        </div>
        <AppBody />
      </div>
    );
  }
}

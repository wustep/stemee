import React, { Component } from 'react';

import logo from './logo.svg';
import './style.css';

export default class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<a href='/'><img src={logo} className="App-logo" alt="logo" /></a>
					<h2>STEM EE Checklist</h2>
				</header>
				{this.props.children}
				<footer className="App-footer">
					<p><a href='https://github.com/wustep/stemee/blob/master/checklist/ABOUT.md#checklist'>About</a> ⬩ <a href='https://github.com/wustep/stemee/blob/master/checklist/ABOUT.md#contact'>Contact</a></p>
				</footer>
			</div>
		);
	}
}

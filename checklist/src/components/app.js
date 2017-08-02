import React, { Component } from 'react';

import UserForm from './user_form';

export default class App extends Component {
	render() {
		let userId = 0;
		let form = <UserForm />;

		if (userId) {
			form = <p>Logged in!</p>
		} 
		return (
			<div>
				<h1>Checklist App</h1>
				{form}
			</div>
		);
	}
}

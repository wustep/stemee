import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

let validOSUIDs = ["500039356"];

export default class UserSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {osuID: "", error: ""};
	}
	handleInputChange(e) {
		this.setState({[e.target.name] : e.target.value});
	}
	handleSubmit() {
		if (this.state.osuID.length === 9) {
			if (validOSUIDs.indexOf(this.state.osuID) !== -1) {
				console.log("Yay!");
				this.setState({error : ''})
			} else {
				this.setState({error : 'Error: OSU ID was not found.'});
			}
		} else {
			this.setState({error : 'Error: Invalid OSU ID or list selection.'})
		}
	}
	render() {
		return (
			<div>
				<p>Login below to track your STEM EE Scholars program requirements!</p>

				<input name='osuID'
							 className="Select-in"
							 type="number"
					  	 placeholder='OSU ID (e.g. 500023231)'
			     	   value={this.state.osuID}
							 pattern="[0-9]"
			     	   onChange={this.handleInputChange.bind(this)}/>
				<br />

				<button className="Select-btn" onClick={this.handleSubmit.bind(this)}>
								Submit
			  </button>
				<br />

				<CSSTransitionGroup transitionName="reactFade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
					<span key="err" className='Select-err'>{this.state.error}</span>
				</CSSTransitionGroup>
			</div>
		);
	}
}

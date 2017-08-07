import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

let errorStyle = {color: "red", marginLeft: "5px"};
let listOptions = [{ value: 'stemee-1-2017', label: '1st Year STEM EE Scholar 2017-18'},
				   { value: 'stemee-2-2017', label: '2nd Year STEM EE Scholar 2017-18'}];
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
					  	 placeholder='OSU ID (e.g. 500023231)'
			     	   className="ListSelect"
			     	   value={this.state.osuID}
			     	   onChange={this.handleInputChange.bind(this)}/>
				<br />

				<button className="ListSelect" onClick={this.handleSubmit.bind(this)}>
								Submit
			  </button>
				<br />

				<CSSTransitionGroup transitionName="reactFade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
					<span key="err" style={errorStyle}>{this.state.error}</span>
				</CSSTransitionGroup>
			</div>
		);
	}
}

import React, { Component } from 'react';

let inputStyle = {
	width: '500px',
	maxWidth: '95%',
	margin: '0 0 10px 0',
	height: '30px'
};
let errorStyle = {color: "red", marginLeft: "5px"};
let listOptions = [{ value: 'stemee-1-2017', label: '1st Year STEM EE Scholar 2017-18'},
				   { value: 'stemee-2-2017', label: '2nd Year STEM EE Scholar 2017-18'}];
let validOSUIDs = ["500039356"];

export default class UserForm extends Component {
	constructor(props) {
		super(props);
		this.state = {osuID: "", listDropdown: null, error: ""};
		if (listOptions.length > 0) {
			this.state.listValue = listOptions[0].value;
		}
	}
	handleInputChange(e) {
		this.setState({[e.target.name] : e.target.value});
	}
	handleSubmit() {
		if (this.state.osuID.length === 9 && this.listDropdown !== null) {
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
				<p>This app is used to track your STEM EE Scholars program requirements!</p>

				<input name='osuID'
					   placeholder='OSU ID (e.g. 500023231)'
			     	   style={inputStyle}
			     	   value={this.state.osuID}
			     	   onChange={this.handleInputChange.bind(this)}/>
				<br />

				<select name="listDropdown" 
						value={this.state.listDropdown} 
						style={inputStyle}
						onChange={this.handleInputChange.bind(this)}>
					{listOptions.map(item => 
						<option key={item.value} value={item.value}>{item.label}</option>
					)}
				</select>
				<br />

				<button onClick={this.handleSubmit.bind(this)}>Submit</button>
				<span style={errorStyle}>{this.state.error}</span>
			</div>
		);
	}
}

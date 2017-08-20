import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';
import { withRouter } from 'react-router-dom';

let validOSUIDs = ["500039356"];
var apiURL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV; // TODO: This is a temp solution for distinguishing API urls

class UserSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {osuID: "", error: ""};
	}
	handleInputChange(e) {
		this.setState({[e.target.name] : e.target.value});
	}
	handleSubmit() {
		fetch(apiURL + "/user/" + this.state.osuID).then((res) => res.json())
		.then((data) => {
			console.log("Yay!");
			console.log(data);
			this.props.history.push("/user/" + this.state.osuID)
		}).catch(() => {
			this.setState({error : 'Error: ID was not found.'});
		});

		if (this.state.osuID.length === 9) {
			if (validOSUIDs.indexOf(this.state.osuID) !== -1) {
				console.log("Yay!");
				this.setState({error : ''})
			} else {
				this.setState({error : 'Error: ID was not found.'});
			}
		}
	}
	render() {
		return (
			<div>
				<p>Login below to track your STEM EE Scholars program requirements!</p>

				<input name='osuID'
							 id='osuID'
							 className="Select-in"
					  	 placeholder='OSU ID (e.g. 500023231)'
			     	   value={this.state.osuID}
			     	   onChange={this.handleInputChange.bind(this)}/>
				<br />

				<button className="Select-btn" onClick={this.handleSubmit.bind(this)}>
								Submit
			  </button>
				<br />

				<CSSTransitionGroup transitionName="reactFade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
					<span key="err" className='err'>{this.state.error}</span>
				</CSSTransitionGroup>
			</div>
		);
	}
}

export default withRouter(UserSelect);

import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { CSSTransitionGroup } from 'react-transition-group';

var apiURL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV; // TODO: This is a temp solution for distinguishing API urls

var lists = [];

fetch(apiURL + "/list").then((res) => res.json())
.then((data) => {
	for (let i = 0; i < data.length; i++) {
		lists[data[i]["ID"]] = data[i]["Name"];
	}
});

class ListSelect extends Component {
  constructor(props) {
    super(props);
		this.state = { error: false, data: null, listDropdown: null };
  }
	componentDidMount() {
		fetch(apiURL + "/user/" + this.props.match.params.user)
		.then((res) => { // TODO: Improve this error formatting
			if (!res.ok) {
				throw new Error("Error fetching User ID!");
			}
			return res.json();
		})
		.then((data) => {
			if (data[0]["Lists"].length === 1) { // If only one list available, go to that list
				this.props.history.push("/user/" + this.props.match.params.user + "/list/" + data[0]["Lists"][0]);
			}
			this.setState({data: data[0], listDropdown: data[0]["Lists"][0]});
		}).catch((err) => {
			this.setState({error: err.toString()});
		});
	}
  handleInputChange(e) {
		this.setState({[e.target.name] : e.target.value});
  }
  handleSubmit() {
		this.props.history.push("/user/" + this.props.match.params.user + "/list/" + this.state.listDropdown);
  }
  render() {
		if (this.state.error) {
			setTimeout(() => { this.props.history.push("/") }, 4500);
			return (
				<div className='err'>
					<p>{this.state.error} Redirecting you now...</p>
				</div>
			);
		} else if (this.state.data) {
			return (
        <div>
          <p>Select the applicable list below.</p>
          <p>User ID: { this.state.data["ID"] }</p>
					<p>Name: { this.state.data["Name"] }</p>

          <select name="listDropdown"
                  className="Select-in"
           				value={this.state.listDropdown}
           				onChange={this.handleInputChange.bind(this)}>
                  {this.state.data["Lists"].map(item => <option key={item} value={item}>{(lists.length >= item) ? lists[item] : item}</option>)}
          </select>
          <br/>

          <button className="Select-in" onClick={this.handleSubmit.bind(this)}>Submit</button>

          <CSSTransitionGroup transitionName="reactFade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            <span key="err" className='Select-err'>{this.state.error}</span>
          </CSSTransitionGroup>
        </div>
      )
		}
		return (<div className='err'><p>Loading...</p></div>);
  }
}

export default withRouter(ListSelect);

import React, { Component } from 'react';
import './style.css';

const apiURL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV; // TODO: This is a temp solution for distinguishing API urls

// Group class, which contains items within and calculates points completed
class Group extends Component {
	groupPointsColor() {
		if (isNaN(this.props.groupCurrentPts) || this.props.groupCurrentPts == 0) {
			return "#ffffff"; // White = none
		} else if (this.props.groupCurrentPts >= this.props.groupMinPts) {
			return "#2DE62D"; // Green = completed
		}
		return "rgb(255, 180, 0)"; // Orange = in progress
	}
	groupBackground() {
		let current = this.props.groupCurrentPts;
		let req = this.props.groupMinPts;
		if (req == 0 || isNaN(req)) { // If MinPts is text or 0, return a purple background for group
			return "rgb(80,40,100)";
		} else { // Otherwise, set up a gradient from green to red based on progress
			let fraction = current / req;
			let left = fraction / 2 * 100; // We have the real percentage be equidistant from the left and right gradient marks
			let right = left * 3;
			console.log('linear-gradient(to right, rgb(0, 180, 140) ' + left + '%, rgb(160,50,50) ' + right + '%)');
			return 'linear-gradient(to right, rgb(0, 180, 140) ' + left + '%, rgb(160,50,50) ' + right + '%)';
		}
	}
	render() {
		return (
			<ul className='Group' style={{background: this.groupBackground()}}>
				<span className='Group-name'>
					{this.props.groupName}
				</span>
				<span className='Group-pts' style={{color: this.groupPointsColor()}}>
					(<span className='Group-current-pts'>{this.props.groupCurrentPts}</span> / <RequiredTotal minQty={this.props.groupMinPts} maxQty={this.props.groupMaxPts} />)
				</span><br/>
				{this.props.children}
			</ul>
		);
	}
}

class Item extends Component {
	constructor(props) {
		super(props);
		this.state = {completed: 0, points: 0}
	}
	componentDidMount() {
		this.setState({points: this.props.itemCompletedQty * this.props.itemPtsPer});
	}
	handleCompletedChange(value) {
		this.setState({completed: value});
		this.setState({points: value * this.props.itemPtsPer});
	}
	render() {
		// Different color for required versus non-requried items
		return (
			<li className='Item' style={{background: (!this.props.itemMinQty.isNaN && this.props.itemMinQty > 0) ? "#555555" : "#666666"}}>
				<span className={'Item-name' + (this.props.itemTooltip ? ' Item-tooltip' : '')} data-tooltip={this.props.itemTooltip}>{this.props.itemName}</span>
				<span className='Item-pts'>[<CompletedQty onCompletedChange={this.handleCompletedChange.bind(this)} itemCompletedQty={this.props.itemCompletedQty} itemMaxQty={this.props.itemMaxQty} /> / <RequiredTotal minQty={this.props.itemMinQty} maxQty={this.props.itemMaxQty} />] ({this.props.itemPtsPer})</span>
			</li>
		)
	}
}

// Min is currently set to always be 0. This is probably always the case, that the minimum a person has done for an entry is 0, but this may change in the future.
class CompletedQty extends Component { /* Used only for Items */
	handleChange(e) {
		this.props.onCompletedChange(e.target.value);
	}
	render() {
		if (this.props.itemCompletedQty && isNaN(this.props.itemCompletedQty)) { // In the case of the example group, we just return the text instead of the input
			return (
				<span>{this.props.itemCompletedQty}</span>
			);
		} else {
			return (
				<input className='Item-pts-current' type='number' min={0}
					   max={this.props.itemMaxQty}
						 onChange={this.handleChange.bind(this)}
					   defaultValue={(this.props.itemCompletedQty ? this.props.itemCompletedQty : 0)}>
				</input>
			);
		}
	}
}

class RequiredTotal extends Component { /* Used for both Items and Groups to simplify tooltipping */
	render() {
		if (this.props.maxQty) {
			return (
				<span className='Item-tooltip' data-tooltip={"Max Possible: " + this.props.maxQty}>{this.props.minQty}</span>
			);
		} else {
			return (
				<span>{this.props.minQty}</span>
			);
		}
	}
}

export default class List extends Component {
	constructor(props) {
		super(props);
		this.state = { error: false, data: null, user: null };
	}
	componentDidMount() {
		fetch(apiURL + "/list/" + this.props.match.params.list)
		.then(res => { // TODO: Improve this error formatting
			if (!res.ok) {
				throw new Error("Error fetching User ID!");
			}
			return res.json();
		})
		.then(data => {
			this.setState({data: data[0]});
		})
		.catch(err => {
			this.setState({error: err.toString()});
		});

		fetch(apiURL + "/user/" + this.props.match.params.user) // TODO: Get /user/list, but also minimize API calls
		.then(res => {
			if (!res.ok) {
				throw new Error("Error fetching User ID!");
			}
			return res.json();
		})
		.then(data => {
			this.setState({user: data[0]});
		})
		.catch(err => {
			console.log(err.toString());
			this.setState({error: err.toString()});
		});
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
					<h3>{ this.state.data["Name"] }</h3>
					{ (this.state.user !== null ) ? (<p>Name: {this.state.user["Name"]}</p>) : (<p></p>) }
					<Group groupName='Group Name' groupCurrentPts='Current Points' groupMinPts='Required Points'>
						<Item itemName='Item Name' itemCompletedQty='Completed Qty' itemMinQty='Required Qty' itemPtsPer='Pts Per'/>
					</Group>
					<br/>
					{this.state.data["Groups"].map((group) => {
						if (group !== null) {
							return (
								<Group key={group["ID"]} groupName={group["Name"]} groupCurrentPts='0' groupMinPts={group["Min_Pts"]} groupMaxPts={group["Max_Pts"]}>
									{group["Items"].map((item) => {
										return (
											<Item key={item["ID"]} itemName={item["Name"]} itemCompletedQty='0' itemMinQty={item["Min"]} itemMaxQty={item["Max"]} itemTooltip={item["Description"]} itemPtsPer={item["Pts_Per"]} />
										);
									})}
								</Group>
							)
						}}) }
					{/*<button className='List-btn'>Reload</button>
					<button className='List-btn'>Submit</button><br/>
					<button className='List-btn'>Approved <label className="Switch">
						<input type="checkbox"/>
						<span className="Slider Slider-round"></span>
					</label></button>*/}
					<br/>
				</div>
			);
		}
		return (<div className='err'><p>Loading...</p></div>);
	}
}

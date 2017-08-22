import React, { Component } from 'react';
import './style.css';

var apiURL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV; // TODO: This is a temp solution for distinguishing API urls

class Group extends Component {
  render() {
    return (
      <ul className='Group'>
        <span className='Group-name'>{this.props.groupName}</span>
        <span className='Group-pts'>({this.props.groupCurrentPts} / <RequiredTotal requiredQty={this.props.groupRequiredPts} maxQty={this.props.groupMaxPts} />)</span><br/>
        {this.props.children}
      </ul>
    );
  }
}

class Item extends Component {
  render() {
    return (
      <li className='Item'>
        <span className={'Item-name' + (this.props.itemTooltip ? ' Item-tooltip' : '')} data-tooltip={this.props.itemTooltip}>{this.props.itemName}</span>
        <span className='Item-pts'>[<CompletedQty itemCompletedQty={this.props.itemCompletedQty} itemMaxQty={this.props.itemMaxQty} /> / <RequiredTotal requiredQty={this.props.itemRequiredQty} maxQty={this.props.itemRequiredMax} />] ({this.props.itemPtsPer})</span>
      </li>
    )
  }
}

// Min is currently set to always be 0. This is probably always the case, that the minimum a person has done for an entry is 0, but this may change in the future.
class CompletedQty extends Component { /* Used only for Items */
  render() {
      if (this.props.itemCompletedQty && isNaN(this.props.itemCompletedQty)) { // In the case of the example group, we just return the text instead of the input
        return (
          <span>{this.props.itemCompletedQty}</span>
        );
      } else {
        return (
          <input className='Item-pts-current' type='number' min={0}
                 max={this.props.itemMaxQty}
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
        <span className='Item-tooltip' data-tooltip={"Max Possible: " + this.props.maxQty}>{this.props.requiredQty}</span>
      );
    } else {
      return (
        <span>{this.props.requiredQty}</span>
      );
    }
  }
}

export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false, data: null };
  }
  componentDidMount() {
    fetch(apiURL + "/list/" + this.props.match.params.list)
    .then((res) => { // TODO: Improve this error formatting
      if (!res.ok) {
        throw new Error("Error fetching User ID!");
      }
      return res.json();
    })
    .then((data) => {
      console.log(data);
      this.setState({data: data[0]});
    }).catch((err) => {
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
      console.log(this.state.data);
      return (
        <div>
          <h3>{ this.state.data["Name"] }</h3>
          <p>Name: [[NAME HERE]]</p>
          <Group groupName='Group Name' groupCurrentPts='Current Points' groupRequiredPts='Required Points'>
            <Item itemName='Item Name' itemCompletedQty='Completed Qty' itemRequiredQty='Required Qty' itemPtsPer='Pts Per'/>
          </Group>
          <br/>
          {this.state.data["Groups"].map((group) => {
            if (group !== null) {
              return (
                <Group key={ group["ID"] } groupName={ group["Name"] } groupCurrentPts={ 0 } groupRequiredPts={ group["Min_Pts"] } groupMaxPts={ group["Max_Pts"] }>
                  {group["Items"].map((item) => {
                    return (
                      <Item itemName={item["Name"]} itemCompletedQty='0' itemRequiredQty={item["Min"]} itemMax={item["Max"]} itemTooltip={item["Description"]} itemPtsPer={item["Pts_Per"]} />
                    );
                  })}
                </Group>
              )
            }}) }
          <button className='List-btn'>Reload</button>
          <button className='List-btn'>Submit</button><br/>
          <button className='List-btn'>Approved <label className="Switch">
            <input type="checkbox"/>
            <span className="Slider Slider-round"></span>
          </label></button>
        </div>
      );
    }
    return (<div className='err'><p>Loading...</p></div>);
  }
}

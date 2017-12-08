import React, { Component } from 'react';
import './style.css';
import './tooltip.css';

const apiURL = (process.env.NODE_ENV === 'production') ? process.env.REACT_APP_API_PROD : process.env.REACT_APP_API_DEV; // TODO: This is a temp solution for distinguishing API urls

// TODO: Link group points to list points to keep a total current points!

// Group class, which contains items within and calculates points completed
class Group extends Component {
  constructor(props) {
    super(props);
    let totalPoints = 0;
    this.state = { items: (typeof this.props.items !== 'undefined') ? this.props.items.map(item => {
      item.points = 0; // TODO: Change this to "Points" for consistency?
      if (item["Submit_Qty"]) {
        item.points = item["Submit_Qty"] * item["Pts_Per"];
        totalPoints += item.points;
      }
      return item;
    }) : [], totalPoints: totalPoints };
  }
  groupPointsColor() {
    if (isNaN(this.props.groupCurrentPts) || this.state.totalPoints === 0) {
      return "#ffffff"; // White = none
    } else if (this.state.totalPoints >= this.props.groupMinPts) {
      return "#2DE62D"; // Green = completed
    }
    return "rgb(255, 210, 0)"; // Orange = in progress
  }
  groupBackground() {
    let current = this.state.totalPoints;
    let req = this.props.groupMinPts;
    if (req == 0 || isNaN(req)) { // If MinPts is text or 0, return a purple background for group
      return "rgb(80,40,100)";
    } else { // Otherwise, set up a gradient from green to red based on progress
      let fraction = current / req;
      let left = fraction / 2 * 100; // We have the real percentage be equidistant from the left and right gradient marks
      let right = left * 3;
      //console.log('linear-gradient(to right, rgb(0, 180, 140) ' + left + '%, rgb(160,50,50) ' + right + '%)');
      return 'linear-gradient(to right, rgb(0, 180, 140) ' + left + '%, rgb(160,50,50) ' + right + '%)';
    }
  }
  updateItemForGroup(itemID, value) {
    if (!!this.state.items.length) {
      let totalPoints = 0;
      this.setState({ // TODO: Can edit to not recalculate points based on ALL items, and just update the individual one...
        items: this.state.items.map(item => {
          if (item.ID == itemID) {
            item.points = value * item["Pts_Per"];
          }
          totalPoints += item.points;
          return item;
        })
      });
      this.setState({totalPoints: totalPoints});
    }
    this.props.updateItemForList(this.props.groupID, itemID, value);
  }
  render() {
    return (
      <ul className='Group' style={{background: this.groupBackground()}}>
        <span className='Group-name'>
          {this.props.groupName}
        </span>
        <span className='Group-pts' style={{color: this.groupPointsColor()}}>
          <span className='Group-current-pts'>{(isNaN(this.props.groupCurrentPts) ? this.props.groupCurrentPts : this.state.totalPoints)}</span> / <RequiredTotal minQty={this.props.groupMinPts}
                 maxQty={this.props.groupMaxPts} />
        </span><br/>
        {!!this.state.items.length && this.state.items.map(item =>
          <Item key={item["ID"]} itemID={item["ID"]} itemName={item["Name"]} itemCompletedQty={item["Submit_Qty"]}
                itemMinQty={item["Min"]} itemMaxQty={item["Max"]} itemTooltip={item["Description"]} itemPtsPer={item["Pts_Per"]}
                updateItemForGroup={this.updateItemForGroup.bind(this)}
            />
        )}
        {this.props.children}
      </ul>
    );
  }
}

class Item extends Component {
  /*constructor(props) {
    super(props);
    //this.state = {completed: 0, points: 0}
  }*/
  componentDidMount() {
    //this.setState({points: this.props.itemCompletedQty * this.props.itemPtsPer});
  }
  handleCompletedChange(value) {
    //this.setState({completed: value});
    //this.setState({points: points});
    //console.log("Completed change" + this.props.itemID + " " + points);
    this.props.updateItemForGroup(this.props.itemID, value);
  }
  render() {
    // Different color for required versus non-requried items
    return (
      <li className='Item' style={{background: (!this.props.itemMinQty.isNaN && this.props.itemMinQty > 0) ? "#555555" : "#666666"}}>
        <span className={'Item-name' + (this.props.itemTooltip ? ' Item-tooltip tooltip' : '')} data-tooltip={this.props.itemTooltip}>{this.props.itemName}</span>
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
        <span className='Item-tooltip tooltip-left' data-tooltip={"Max Possible: " + this.props.maxQty}>{this.props.minQty}</span>
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
    this.state = { error: false, data: null, user: null, totalPoints: 0 };
  }
  componentDidMount() {
    // Fetch list info
    fetch(apiURL + "/list/" + this.props.match.params.list)
    .then(res => { // TODO: Improve this error formatting
      if (!res.ok) {
        throw new Error("Error fetching List ID!");
      }
      return res.json();
    })
    .then(data => {
      // Fetch user info
      fetch(apiURL + "/user/" + this.props.match.params.user) // TODO: Maybe minimize API calls here...
      .then(res => {
        if (!res.ok) {
          throw new Error("Error fetching User ID!");
        }
        return res.json();
      })
      .then(data2 => {
        this.setState({user: data2[0]});
        // Fetch user's list
        fetch(apiURL + "/user/" + this.props.match.params.user + "/list/" + this.props.match.params.list)
        .then(res => {
          if (!res.ok) {
            throw new Error("Error fetching User List!");
          }
          return res.json();
        })
        .then(data3 => {
          let totalPoints = 0;
          // Iterate through all group items and check if they are set or not
          let groups = data[0]["Groups"];
          for (let i = 0; i < groups.length; i++) { // TODO: Revise to maps or somethin this is messy
            if (data[0]["Groups"][i]) {
              let groupItems = data[0]["Groups"][i]["Items"];
              for (let j = 0; groupItems && j < groupItems.length; j++) {
                let groupItem = groupItems[j];
                if (data3[groupItem["ID"]] && typeof data3[groupItem["ID"]] !== 'undefined') {
                  if ("Unapproved Qty" in data3[groupItem["ID"]]) {
                    let unapprovedQty = data3[groupItem["ID"]]["Unapproved Qty"]; // Previously submitted qty
                    groupItem["Qty"] = unapprovedQty;
                    groupItem["Submit_Qty"] = unapprovedQty;
                    this.setState({totalPoints: this.state.totalPoints + parseInt(unapprovedQty, 10) * parseInt(groupItem["Pts_Per"], 10)});
                  }
                  /*
                  // TODO: Approved quantities
                  if ("Approved Qty" in data3[groupItem["ID"]]) {
                    data[0]["Groups"][i]["Items"][j]["Approved Qty"] = data3[groupItem["ID"]]["Approved Qty"];
                  }
                  */
                }
              }
            }
          }
          this.setState({data: data[0]}); // Set data after running through all that stuff.
        })
        .catch(err => {
          console.log(err.toString());
          this.setState({error: err.toString()});
        });
      })
      .catch(err => {
        console.log(err.toString());
        this.setState({error: err.toString()});
      });
    })
    .catch(err => {
      console.log(err.toString());
      this.setState({error: err.toString()});
    });
  }
  updateItemForList(groupID, itemID, qty) {
    let groups = this.state.data["Groups"];
    let groupItems = groups[groupID]["Items"];
    let groupItemID = -1;
    for (let i = 0; groupItemID === -1 && i < groupItems.length; i++) {
      if (groupItems[i]["ID"] == itemID) {
        groupItemID = i;
      }
    }
    if (groupItemID >= 0) { // group item to update was found!
      // Get current quantities
      let pointsPer = groups[groupID]["Items"][groupItemID]["Pts_Per"];
      let prevQty = groups[groupID]["Items"][groupItemID]["Qty"] ? groups[groupID]["Items"][groupItemID]["Qty"] : 0;
      this.setState({
        totalPoints: (this.state.totalPoints + (qty - prevQty) * pointsPer)
      });
      // Set quantity
      groups[groupID]["Items"][groupItemID]["Qty"] = qty;
      // Change state of data
      this.setState({ // TODO: Is this efficient? Not sure.
        data: {
          ...this.state.data,
          groups
        }
      });
    } else {
      this.setState({error: "Group item not found on update: GROUP: " + groupID + " ITEM: " + itemID + ". Please screenshot & report!"});
    }
  }
  handleReload() {
    if (window.confirm("Are you sure? You will lose all data since the last time you clicked submit!")) {
      window.location.reload()
    }
  }
  handleSubmit() {
    let groups = this.state.data["Groups"];
    let changes = {};
    let changePts = 0;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i]) {
        let items = groups[i]["Items"];
        for (let j = 0; j < items.length; j++) {
          // Check for changed item
          let priorSubmitQty = (typeof items[j]["Submit_Qty"] !== 'undefined') ? parseInt(items[j]["Submit_Qty"]) : 0;
          if (items[j] && typeof(items[j]["Qty"]) !== 'undefined' && items[j]["Qty"] != priorSubmitQty) {
            changePts += ((parseInt(items[j]["Qty"]) - priorSubmitQty) * parseInt(items[j]["Pts_Per"]));
            changes[items[j]["ID"]] = items[j]["Qty"];
            if (items[j]["Max"] && items[j]["Qty"] > items[j]["Max"]) { // Check for invalid
              alert("Oops! \"" + items[j]["Name"] + "\" should not exceed " + items[j]["Max"] + ". Changes were not saved!");
              return;
            }
          }
        }
      }
    }
    // Inform user of changes (if any)
    let len = (changes) ? Object.keys(changes).length : 0;
    if (changes && len > 0) {
      fetch(apiURL + "/user/" + this.props.match.params.user + "/list/" + this.props.match.params.list,
           {method: "POST", body: JSON.stringify(changes), headers: new Headers({"Content-Type": "application/json"})})
      .then(res => {
        if (!res.ok) {
          console.log(res);
          throw new Error("Submitting changes! Changes were not saved.");
        }
        return res.json();
      })
      .then(json => {
        // ON success, save Submit_Qtys to state.
        let groups = this.state.data["Groups"];
        for (let i = 0; i < groups.length; i++) {
          if (groups[i]) {
            let items = groups[i]["Items"];
            for (let j = 0; j < items.length; j++) {
              items[j]["Submit_Qty"] = items[j]["Qty"];
            }
          }
        }
        alert(`Submitted ${len} change${(len > 1) ? 's': ''} with ${changePts} point${(changePts != 0) ? 's' : ''}!`); // Pluralize
      })
      .catch(err => {
        alert(err.toString());
      });
    } else {
      alert("No changes to submit!");
    }
  }
  render() {
    if (this.state.error) { // Removed redirect for now for testing.
      //setTimeout(() => { this.props.history.push("/") }, 4500);
      return (
        <div className='err'>
          <p>{this.state.error}.</p>
        </div>
      );
    } else if (this.state.data) {
      return (
        <div>
          <h3>{ this.state.data["Name"] }</h3>
          { (this.state.user !== null ) ? (<p>Name: {this.state.user["Name"]}<br/>Points: {this.state.totalPoints} / {this.state.data["Min_Pts"]}</p>) : (<p></p>) }
          <Group groupName='Group Name' groupCurrentPts='Current Points' groupMinPts='Required Points'>
            <Item itemName='Item Name' itemCompletedQty='Completed Qty' itemMinQty='Required Qty' itemPtsPer='Pts Per'/>
          </Group>
          <br/>
          {this.state.data["Groups"].map((group) => {
            if (group !== null) {
              return (
                <Group updateItemForList={this.updateItemForList.bind(this)} items={group["Items"]} key={group["ID"]} groupID={group["ID"]} groupName={group["Name"]} groupCurrentPts={0} groupMinPts={group["Min_Pts"]} groupMaxPts={group["Max_Pts"]} />
              )
            }})}
          <button className='List-btn' onClick={this.handleReload}>Reload</button>
          <button className='List-btn' onClick={this.handleSubmit.bind(this)}>Submit</button><br/>
          <br/>
        </div>
      );
    }
    return (<div className='err'><p>Loading...</p></div>);
  }
}

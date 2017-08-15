import React, { Component } from 'react';
import './style.css';

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
  render() {
    return (
      <div>
        <h3>1st Year STEM EE Scholars Program Requirements (2017-18)</h3>
        <p>Name: Stephen Wu</p>
        <Group groupName='Group Name' groupCurrentPts='Current Points' groupRequiredPts='Required Points'>
          <Item itemName='Item Name' itemCompletedQty='Completed Qty' itemRequiredQty='Required Qty' itemPtsPer='Pts Per'/>
        </Group>
        <br/><br/>
        <Group groupName='Events' groupCurrentPts='0' groupRequiredPts='32'>
          <Item itemName='STEM EE Scholars Events' itemCompletedQty='0' itemRequiredQty='6' itemMinQty='0' itemTooltip='3 STEM EE  Scholars Events are required each semester!' itemPtsPer='2' />
            <li className='Item'>
            <span className='Item-name Item-tooltip' data-tooltip="1 H&S event is recommended each semester!">Honors & Scholars Events</span>
            <span className='Item-pts'>[<input className='Item-pts-current' type='number' min='0' max='2' defaultValue='0'></input> / <span className='Item-tooltip' data-tooltip="Max Possible: 2">0</span>] (2)</span>
          </li>
          <li className='Item'>
            <span className='Item-name Item-tooltip' data-tooltip="1 Diversity event is required each semester!">Diversity Event</span>
            <span className='Item-pts'>[<input className='Item-pts-current' type='number' min='0' max='2' defaultValue='0'></input> / <span className='Item-tooltip' data-tooltip="Max Possible: 2">2</span>] (2)</span>
          </li>
        </Group>
        <button className='List-btn'>Reload</button>
        <button className='List-btn'>Submit</button><br/>
        <button className='List-btn'>Approved <label className="Switch">
          <input type="checkbox"/>
          <span className="Slider Slider-round"></span>
        </label></button>
      </div>
    );
  }
}

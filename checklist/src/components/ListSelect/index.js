import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

let listOptions = [{ value: 'stemee-1-2017', label: '1st Year STEM EE Scholar 2017-18'},
				           { value: 'stemee-2-2017', label: '2nd Year STEM EE Scholar 2017-18'}];

export default class ListSelect extends Component {
  constructor(props) {
    super(props);
    this.state = { list: listOptions[listOptions.length - 1].value } // Get the last option from listOptions
  }
  handleInputChange() {

  }
  handleSubmit() {

  }
  render() {
    return(
      <div>
        <p>Select the applicable list below.</p>

        <select name="listDropdown"
                className="Select-in"
         				value={this.state.listDropdown}
         				onChange={this.handleInputChange.bind(this)}>
                {listOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <br/>

        <button className="Select-in" onClick={this.handleSubmit.bind(this)}>Submit</button>

        <CSSTransitionGroup transitionName="reactFade" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          <span key="err" className='Select-err'>{this.state.error}</span>
        </CSSTransitionGroup>
      </div>
    )
  }
}

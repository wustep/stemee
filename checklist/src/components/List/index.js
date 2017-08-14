import React, { Component } from 'react';
import './style.css';

export default class List extends Component {
  render() {
    return (
      <div><h1>List</h1><br/>
      <ul className='Group'>
        <span className='Group-name'>Events</span>
        <span className='Group-pts'>[0 / 50]</span><br/>
        <li className='Item'>
          <span className='Item-name Item-tooltip' data-tooltip="8 STEM Events are required each semester!">STEM EE Scholars Events</span>
          <span className='Item-pts'>[0 / 27]</span>
        </li>
        <li className='Item'>
          <span className='Item-name Item-tooltip' data-tooltip="1 H&S event is recommended each semester!">Honors & Scholars Events</span>
          <span className='Item-pts'>[0 / <span className='Item-tooltip' data-tooltip="Max Possible: 40">27</span>]</span>
        </li>
      </ul>
      </div>
    );
  }
}

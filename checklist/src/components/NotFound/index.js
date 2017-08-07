import React, { Component } from 'react';

export default class NotFound extends Component {
  render() {
    setTimeout(() => { this.props.history.push("/") }, 4500);
    return (
      <div className="NotFound err">
        <h2>404</h2> <p>Not Found :(. Redirecting you back now...</p>
      </div>
    );
  }
}

import React from 'react';
import ReactGA from 'react-ga';

if (process.env.REACT_APP_GOOGLE_ANALYTICS) {
  ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS);
}

const withTracker = (WrappedComponent) => {
  const trackPage = (page) => {
    ReactGA.set({ page });
    ReactGA.pageview(page);
  };

  const HOC = (props) => {
    const page = props.location.pathname;
	if (process.env.REACT_APP_GOOGLE_ANALYTICS) {
	  trackPage(page);
	}

    return (
      <WrappedComponent {...props} />
    );
  };
  
  return HOC;
};

export default withTracker;
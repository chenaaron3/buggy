import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { setPusherClient } from 'react-pusher';
import Pusher from 'pusher-js';

const pusherClient = new Pusher("18daa371eebed30fcef8", {
  cluster: 'us3'
});

setPusherClient(pusherClient);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

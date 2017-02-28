import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import NewCastChecker from '../modules/NewCastChecker';

const _newCastChecker = new NewCastChecker();
let isEnabledAutoRedirect = false;

export default class StandByPage extends Page {
  putButton() {
    const parent = document.getElementById('watch_like_buttons');
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    parent.appendChild(child);
    ReactDOM.render(<AutoRedirectButton notify={this.recieveNotify} />, child);
    _newCastChecker.run();
  }

  recieveNotify(isToggledOn) {
    console.log('toggled');
    isEnabledAutoRedirect = isToggledOn;
  }
}

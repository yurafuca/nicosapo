import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import Common from "../common/Common";
const autoRedirectButton = new AutoRedirectButton();

export default class StandByPage extends Page {
  putButton() {
    const parent = document.getElementsByClassName('infobox')[0];
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    parent.appendChild(child);
    ReactDOM.render(<AutoRedirectButton />, child);
  }
}

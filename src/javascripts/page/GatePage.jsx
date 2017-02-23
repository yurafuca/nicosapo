import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../page/Page';
import AutoEnterProgramButton from "../buttons/AutoEnterProgramButton";

function prependChild(newNode, parentNode) {
    parentNode.insertBefore(newNode, parentNode.firstChild);
}

export default class GatePage extends Page {
  putButton() {
    const parent = document.getElementsByClassName('gate_title')[0];
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    prependChild(child, parent);
    ReactDOM.render(<AutoEnterProgramButton />, child);
  }
}

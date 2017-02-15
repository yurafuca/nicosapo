import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../page/Page';
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoEnterCommunityButton = new AutoEnterCommunityButton();

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default class CommunityPage extends Page {
  putButton() {
    const beforeChild = document.getElementById('comSetting_hide');
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    insertAfter(child, beforeChild);
    ReactDOM.render(<AutoEnterCommunityButton />, child);
  }
}

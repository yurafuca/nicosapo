import React from 'react';
import ReactDOM from 'react-dom';
import Page from '../page/Page';
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";

export default class ChannelPage extends Page {
  putButton() {
    const parent = document.getElementsByClassName('join_leave')[0];
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    parent.appendChild(child);
    ReactDOM.render(<AutoEnterCommunityButton />, child);
  }
}

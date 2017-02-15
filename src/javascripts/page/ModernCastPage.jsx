import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import CastPage from '../page/CastPage';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import Common from "../common/Common";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();

export default class ModernCastPage extends CastPage {
  putButton() {
    const parent = document.querySelector('.program-detail div');
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    parent.appendChild(child);
    ReactDOM.render(
      <div style={{display: 'inline-block'}}>
        <AutoRedirectButton />
        <AutoEnterCommunityButton />
      </div>, child
    );
  }

  putExtendedBar() {
    super.putExtendedBar('#bourbon-block');
  }

  setUpExtendedBar() {
    super.setUpExtendedBar();
    $('#extended-bar').css('width', '1024px');
  }
}

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import CastPage from '../page/CastPage';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";

export default class ModernCastPage extends CastPage {
  putButton() {
    const parent = document.querySelector('.program-detail div');
    const child = document.createElement('div');
    child.id = 'nicosapo_buttons';
    parent.appendChild(child);
    ReactDOM.render(
      <div style={{display: 'inline-block'}}>
        <AutoRedirectButton notify={super.recieveNotify} />
        <AutoEnterCommunityButton />
      </div>, child
    );
  }

  buildExBar() {
    super.buildExBar('bourbon-block');
    this.stretchExBar();
  }

  stretchExBar() {
    $('#extended-bar').css({'cssText': 'width: 1024px !important;'});
  }
}

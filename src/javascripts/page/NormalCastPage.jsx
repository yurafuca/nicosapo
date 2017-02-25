import React from 'react';
import ReactDOM from 'react-dom';
import CastPage from '../page/CastPage';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";

export default class NormalCastPage extends CastPage {
  putButton() {
    const parent = document.getElementsByClassName('meta')[0];
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

  buildExtendedBar() {
    super.buildExtendedBar('watch_player_top_box');
  }
}

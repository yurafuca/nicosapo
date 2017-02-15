import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";
import Storage from "../modules/Storage";

export default class AutoEnterCommunityButton extends React.Component {
  constructor() {
    super();
    this._className      = 'auto_enter_community_button';
    this._label          = `(このコミュニティに) 自動入場`;
    this._balloonMessage = `このコミュニティ・チャンネルが放送を始めたとき自動で枠を新しいタブで開きます．
                            [⚠️負荷軽減のため最大登録数は5を目安にしてください]
                            [💡自動次枠移動が ON の状態でも移動先の枠が新しいタブで開かれます]`;
    this._balloonPos    = 'up';
    this._balloonLength = 'xlarge';
    this.setUp();
    this.onClick        = this.onClick.bind(this);
  }

  setUp() {
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterCommunityList'
      },
      (response) => {
        const idHolder = new IdHolder();
        if (response[idHolder.communityId]) {
          this.toggleOn();
        } else {
          this.toggleOff();
        }
      }
    );
  }

  toggleOn() {
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_on');
    $link.removeClass('switch_is_off');
    $link.text(`${this._label}ON`);
  }

  toggleOff() {
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_off');
    $link.removeClass('switch_is_on');
    $link.text(`${this._label}OFF`);
  }

  isToggledOn() {
    const $link = $($(`.${this._className}`).find('.link'));
    const isToggledOn = $link.hasClass('switch_is_on');
    return isToggledOn;
  }

  onClick(e) {
    if (this.isToggledOn()) {
      this.toggleOff();
      this.removeAsAutoEnter();
    } else {
      this.toggleOn();
      this.saveAsAutoEnter();
    }
  }

  saveAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.communityId; // Required for Both.
    const thumbnail = $('meta[property="og:image"]').attr('content'); // Required for Both.
    let title; // Required for Both.
    let openDate; // Required for Live only.
    let owner; // Required for Community only.
    const pageType = PageType.get();

    console.info(PageType);

    if (pageType === 'COMMUNITY_PAGE') {
      title = $('div.communityData > h2.title > a').text().replace(/[ ]/, '');
      owner = $('div.communityData tr.row:first-child > td.content > a').text().replace(/[ ]/, '');
    } else if (pageType === 'CHANNEL_PAGE') {
      title = $('h3.cp_chname').text();
      owner = $('p.cp_viewname').text();
    } else if (pageType === 'NORMAL_CAST_PAGE' || pageType === 'OFFICIAL_CAST_PAGE') {
      title = $($('.commu_info').find('a').get(0)).html() || $('.ch_name').html();
      owner = $('.nicopedia_nushi').find('a').text() || $('.company').text();
    } else if (pageType === 'MODERN_CAST_PAGE') {
      title = $('.program-community-name').text();
      owner = $($('.program-broadcaster-name').find('a').get(0)).text();
    }

    console.info(title, owner);

    Storage.saveToNestedLocalStorage('autoEnterCommunityList', id, {
      state: 'init',
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    });
  }

  removeAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.communityId;
    Storage.removeFromNestedLocalStorage('autoEnterCommunityList', id);
  }

  render() {
    return (
      <span className={this._className + (' on_off_button')} onClick={this.onClick}>
          <a className={('link switch_is_on')}
            data-balloon={this._balloonMessage}
            data-balloon-pos={this._balloonPos}
            data-balloon-length={this._balloonLength}>
            Now Loading...
          </a>
      </span>
    );
  }
}

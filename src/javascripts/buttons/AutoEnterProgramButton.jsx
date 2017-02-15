import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import Storage from "../modules/Storage";

export default class AutoEnterProgramButton extends React.Component {
  constructor() {
    super();
    this._className      = 'auto_enter_program_button';
    this._label          = `(この番組に) 自動入場`;
    this._balloonMessage = `この番組が始まったとき自動で番組を新しいタブで開きます．
                            [⚠️負荷軽減のため最大登録数は5を目安にしてください]
                            [💡登録した番組は設定画面より設定できます]`;
    this._balloonPos    = 'up';
    this._balloonLength = 'xlarge';
    this.setUp();
    this.onClick        = this.onClick.bind(this);
  }

  setUp() {
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterProgramList'
      },
      (response) => {
        const idHolder = new IdHolder();
        if (response[idHolder.liveId]) {
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
    const id = idHolder.liveId; // Required for Both.
    const thumbnail = $('meta[property="og:image"]').attr('content'); // Required for Both.
    const title = $('meta[property="og:title"]').attr('content');  // Required for Both.
    const openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content"); // Required for Live only.
    let owner; // Required for Community only.

    Storage.saveToNestedLocalStorage('autoEnterProgramList', id, {
      state: 'init',
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    });
  }

  removeAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.liveId;
    Storage.removeFromNestedLocalStorage('autoEnterProgramList', id);
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

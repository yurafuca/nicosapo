import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import Storage from "../modules/Storage";

export default class AutoEnterProgramButton extends React.Component {
  constructor() {
    super();
    this.state = { isToggledOn: null };
    this._className      = 'auto_enter_program_button';
    this._label          = `(この番組に) 自動入場`;
    this._balloonMessage = `この番組が始まったとき自動で番組を新しいタブで開きます．
                            [⚠️負荷軽減のため最大登録数は5を目安にしてください]
                            [💡登録した番組は設定画面より設定できます]`;
    this._balloonPos    = 'up';
    this._balloonLength = 'xlarge';
    this.onClick        = this.onClick.bind(this);
  }

  componentDidMount() {
    console.log('didmount');
    this.setUp();
  }

  setUp() {
    chrome.runtime.sendMessage({
        purpose: 'getFromNestedLocalStorage',
        key: 'autoEnterProgramList'
      },
      (response) => {
        const idHolder = new IdHolder();
        if (response[idHolder.liveId]) {
          this.setState({ isToggledOn: true });
        } else {
          this.setState({ isToggledOn: false });
        }
      }
    );
  }

  toggle() {
    if (this.state.isToggledOn) {
      this.setState({ isToggledOn: false });
    } else {
      this.setState({ isToggledOn: true });
    }
  }

  onClick(e) {
    if (this.state.isToggledOn) {
      this.removeAsAutoEnter();
    } else {
      this.saveAsAutoEnter();
    }
    this.toggle();
  }

  saveAsAutoEnter() {
    const idHolder  = new IdHolder();
    const id        = idHolder.liveId;
    const thumbnail = $('meta[property="og:image"]').attr('content');
    const title     = $('meta[property="og:title"]').attr('content');
    const openDate  = $('.kaijo meta[itemprop="datePublished"]').attr("content");
    const owner     = null;
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
          <a className={'link ' + (this.state.isToggledOn ? 'switch_is_on' : 'switch_is_off')}
            data-balloon={this._balloonMessage}
            data-balloon-pos={this._balloonPos}
            data-balloon-length={this._balloonLength}>
            {(this.state.isToggledOn ? `${this._label}ON` : `${this._label}OFF`)}
          </a>
      </span>
    );
  }
}

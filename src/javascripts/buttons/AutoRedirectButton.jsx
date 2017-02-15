import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Common from "../common/Common"

// TODO: make()はなくなった
// TODO: $('#watch_title_box .meta').css('overflow', 'visible'); をどこかでする

export default class AutoRedirectButton extends React.Component {
  constructor() {
    super();
    this._className      = 'auto_redirect_button';
    this._label          = `自動次枠移動`;
    this._balloonMessage = `このページを開いたままにしておくと，新しい枠で放送が始まったとき自動で枠へ移動します．`;
    this._balloonPos     = 'up';
    this._balloonLength  = 'xlarge';
    this.setUp();
    this.onClick         = this.onClick.bind(this);
  }

  setUp() {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.autoJump.enable'
      },
      (response) => {
        console.info(response);
        if (Common.enabledOrNull(response)) {
          this.toggleOn();
        } else {
          this.toggleOff();
        }
      }
    )
  }

  // getMessage() {
  //   return `このページを開いたままにしておくと，新しい枠で放送が始まったとき自動で枠へ移動します．`;
  // }

  // getToolTip() {
  //   // return (
  //   //   <Tooltip>{[
  //   //       <span style={{fontSize: '14px'}}></span>]}
  //   //   </Tooltip>
  //   // )
  //   const tooltip = (
  //     <Tooltip id="tooltip">{[
  //         <span style={{fontSize: '14px'}}>
  //           <span style={{color:'#adff2f'}}>てすと<br/></span>
  //           ほげ
  //         </span>
  //       ]}
  //     </Tooltip>
  //   );
  //   return tooltip;
  // }

  // @Override
  toggleOn() {
    console.info('toggleon');
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_on');
    $link.removeClass('switch_is_off');
    $link.text(`${this._label}ON`);
  }

  // @Override
  toggleOff() {
    console.info('toggleoff');
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_off');
    $link.removeClass('switch_is_on');
    $link.text(`${this._label}OFF`);
  }

  // @Override
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

  // @Override
  saveAsAutoEnter() {
    // Do nothing.
  }

  // @Override
  removeAsAutoEnter() {
    // Do nothing.
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

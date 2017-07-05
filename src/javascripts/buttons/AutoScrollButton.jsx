import $ from 'jquery'
import React from 'react'
import store from 'store'

export default class AutoScrollButton extends React.Component {
  constructor() {
    super();
    this.state           = { isToggledOn: null };
    this._className      = 'auto_scroll_button';
    this._balloonMessage = `次枠へ移動したとき，前回の位置までスクロールします`,
    this._balloonPos     = 'up';
    this._balloonLength  = 'xlarge';
    this.onClick         = this.onClick.bind(this);
  }

  componentDidMount() {
    this.setUp();
  }

  setUp() {
    chrome.runtime.sendMessage({
        purpose: 'getFromLocalStorage',
        key: 'options.autoScroll.enable'
      },
      (response) => {
        if (response == 'enable' || response == null) {
          this.setState({ isToggledOn: true });
        } else {
          this.setState({ isToggledOn: false });
        }
      }
    )
  }

  onClick(e) {
    this.toggle();
  }

  toggle() {
    chrome.runtime.sendMessage({
      purpose: 'saveToLocalStorage',
      key: 'options.autoScroll.enable',
      value: !this.state.isToggledOn ? 'enable' : 'disable'
    });
    if (this.state.isToggledOn) {
      this.setState({ isToggledOn: false });
    } else {
      this.setState({ isToggledOn: true });
    }
  }

  render() {
    return (
      <span className={this._className + (' on_off_button')} onClick={this.onClick}>
          <a className={'link ' + (this.state.isToggledOn ? 'switch_is_on' : 'switch_is_off')}
            data-balloon={this._balloonMessage}
            data-balloon-pos={this._balloonPos}
            data-balloon-length={this._balloonLength}>
            <i className="material-icons rotate180">publish</i>
          </a>
      </span>
    );
  }
}

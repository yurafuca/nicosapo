import $ from "jquery";
import React from "react";
import store from "store";
import { OverlayTrigger, Popover } from "react-bootstrap";

export default class AutoScrollButton extends React.Component {
  constructor() {
    super();
    this.state = { isToggledOn: null };
    this._className = "auto_scroll_button";
    this._popoverTitle = "自動スクロール";
    this._popoverMessage = (
      <span>次枠へ移動したとき前回の位置までスクロールします</span>
    );
    this._popoverPos = "up";
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.setUp();
  }

  setUp() {
    chrome.runtime.sendMessage(
      {
        purpose: "getFromLocalStorage",
        key: "options.autoScroll.enable"
      },
      response => {
        if (response == "enable" || response == null) {
          this.setState({ isToggledOn: true });
        } else {
          this.setState({ isToggledOn: false });
        }
      }
    );
  }

  onClick(e) {
    this.toggle();
  }

  toggle() {
    chrome.runtime.sendMessage({
      purpose: "saveToLocalStorage",
      key: "options.autoScroll.enable",
      value: !this.state.isToggledOn ? "enable" : "disable"
    });
    if (this.state.isToggledOn) {
      this.setState({ isToggledOn: false });
    } else {
      this.setState({ isToggledOn: true });
    }
  }

  render() {
    const popover = (
      <Popover
        id="popover"
        title={this._popoverTitle}
        style={{ maxWidth: "1000px", color: "#222" }}
      >
        <span style={{ lineHeight: 1.5, fontSize: "12px" }}>
          {this._popoverMessage}
        </span>
      </Popover>
    );
    return (
      <span
        className={this._className + " on_off_button"}
        onClick={this.onClick}
      >
        <OverlayTrigger
          trigger={["hover", "focus"]}
          animation={false}
          placement="top"
          overlay={popover}
        >
          <a
            className={
              "link " +
              (this.state.isToggledOn ? "switch_is_on" : "switch_is_off")
            }
          >
            <i className="material-icons rotate180">publish</i>
          </a>
        </OverlayTrigger>
      </span>
    );
  }
}

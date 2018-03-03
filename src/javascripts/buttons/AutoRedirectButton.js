import React from "react";
import { OverlayTrigger, Popover } from "react-bootstrap";

export default class AutoRedirectButton extends React.Component {
  constructor() {
    super();
    this.state = { isToggledOn: null };
    this._className = "auto_redirect_button";
    this._label = `自動次枠移動: `;
    this._popoverTitle = "自動次枠移動";
    this._popoverMessage = (
      <span>
        このページを開いたままにしておくと，新しい枠で放送が始まったとき自動で枠へ移動します．
      </span>
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
        key: "options.autoJump.enable"
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
    this.props.notify(!this.state.isToggledOn);
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
            data-balloon={this._balloonMessage}
            data-balloon-pos={this._balloonPos}
            data-balloon-length={this._balloonLength}
          >
            {this.state.isToggledOn
              ? `${this._label}オン`
              : `${this._label}オフ`}
          </a>
        </OverlayTrigger>
      </span>
    );
  }
}

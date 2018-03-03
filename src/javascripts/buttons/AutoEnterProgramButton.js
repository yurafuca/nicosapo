import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import Buttons from "../buttons/Buttons";
import IdHolder from "../modules/IdHolder";
import Storage from "../modules/Storage";
import { OverlayTrigger, Popover } from "react-bootstrap";

export default class AutoEnterProgramButton extends React.Component {
  constructor() {
    super();
    this.state = { isToggledOn: null };
    this._className = "auto_enter_program_button";
    this._label = `(この番組に) 自動入場: `;
    this._popoverTitle = "番組への自動入場";
    this._popoverMessage = (
      <span>
        この番組が始まったとき自動で番組を新しいタブで開きます<br />
        <strong>📢注意: </strong>
        <font color="#24963e">
          負荷軽減のため最大登録数は5を目安にしてください
        </font>
        <br />
        <strong>📢注意: </strong>
        <font color="#24963e">登録した番組は設定画面より設定できます</font>
      </span>
    );
    this._popoverPos = "up";
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    console.log("didmount");
    this.setUp();
  }

  setUp() {
    chrome.runtime.sendMessage(
      {
        purpose: "getFromNestedLocalStorage",
        key: "autoEnterProgramList"
      },
      response => {
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
    const idHolder = new IdHolder();
    const id = idHolder.liveId;
    const thumbnail = $('meta[property="og:image"]').attr("content");
    const title = $('meta[property="og:title"]').attr("content");
    const openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content");
    const owner = null;
    Storage.saveToNestedLocalStorage("autoEnterProgramList", id, {
      state: "init",
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    });
  }

  removeAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.liveId;
    Storage.removeFromNestedLocalStorage("autoEnterProgramList", id);
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

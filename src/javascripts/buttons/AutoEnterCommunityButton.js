import $ from "jquery";
import React from "react";
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";
import Storage from "../modules/Storage";
import { OverlayTrigger, Popover } from "react-bootstrap";
import MetaData from '../modules/MetaData';
import {
  ON_VISIT,
  SHOULD_MOVE_AUTOMATICALLY,
  SHOULD_NOT_MOVE_AUTOMATICALLY,
  SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY, SHOULD_OPEN_COMMUNITY_AUTOMATICALLY
} from '../chrome/runtime.onMessage';

export default class AutoEnterCommunityButton extends React.Component {
  constructor() {
    super();
    this.state = { isToggledOn: null };
    this._className = "auto_enter_community_button";
    this._label = `(このコミュニティに) 自動入場: `;
    this._popoverTitle = "コミュニティへの自動入場";
    this._popoverMessage = (
      <span>
        このコミュニティ・チャンネルが放送を始めたとき自動で枠を新しいタブで開きます．<br />
        <strong>📍 NOTE： </strong>
        <font color="#24963e">
          負荷軽減のため最大登録数は 5 を目安にしてください
        </font>
        <br />
        <strong>📍 NOTE： </strong>
        <font color="#24963e">
          自動次枠移動を オン にすると自動入場しません
        </font>
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
        purpose: "getFromNestedLocalStorage",
        key: "autoEnterCommunityList"
      },
      response => {
        const idHolder = new IdHolder();
        if (response[idHolder.communityId]) {
          this.setState({ isToggledOn: true });
        } else {
          this.setState({ isToggledOn: false });
        }
      }
    );
  }

  toggle() {
    const metaData = MetaData.get();
    if (this.state.isToggledOn) {
      this.setState({ isToggledOn: false });
      const option = {
        purpose: SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY,
        metaData: metaData
      };
      chrome.runtime.sendMessage(option);
    } else {
      this.setState({ isToggledOn: true });
      const option = {
        purpose: SHOULD_OPEN_COMMUNITY_AUTOMATICALLY,
        metaData: metaData
      };
      chrome.runtime.sendMessage(option);
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
    const metaData = MetaData.get();
    Storage.saveToNestedLocalStorage("autoEnterCommunityList", metaData.communityId, {
      state: "init",
      thumbnail: metaData.thumbnail,
      title: metaData.title,
      openDate: metaData.openDate,
      owner: metaData.owner
    });
  }

  removeAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.communityId;
    Storage.removeFromNestedLocalStorage("autoEnterCommunityList", id);
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
            <i className="material-icons">
              event_seat
            </i>
            {this.state.isToggledOn
              ? `${this._label}オン`
              : `${this._label}オフ`}
          </a>
        </OverlayTrigger>
      </span>
    );
  }
}

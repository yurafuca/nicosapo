import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";
import Buttons from "../buttons/Buttons";
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";
import Storage from "../modules/Storage";
import { OverlayTrigger, Popover } from "react-bootstrap";

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
        <strong>📢注意: </strong>
        <font color="#24963e">
          負荷軽減のため最大登録数は 5 を目安にしてください
        </font>
        <br />
        <strong>📢注意: </strong>
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
    const id = idHolder.communityId;
    const thumbnail = $('meta[property="og:image"]').attr("content");
    const pageType = PageType.get();
    const openDate = null;
    let title, owner;
    switch (pageType) {
      case "COMMUNITY_PAGE":
        title = $("div.communityData > h2.title > a")
          .text()
          .replace(/[\n\t]/g, "");
        owner = $("div.communityData tr.row:first-child > td.content > a")
          .text()
          .replace(/[\n\t]/g, "");
        break;
      case "CHANNEL_PAGE":
        title = $("h3.cp_chname").text();
        owner = $("p.cp_viewname").text();
        break;
      case "NORMAL_CAST_PAGE": // PAIR A
      case "OFFICIAL_CAST_PAGE": // PAIR A
        title =
          $(
            $(".commu_info")
              .find("a")
              .get(0)
          ).html() || $(".ch_name").html();
        owner =
          $(".nicopedia_nushi")
            .find("a")
            .text() || $(".company").text();
        break;
      case "CHIMERA_CAST_PAGE":
        title = $(".program-community-name").text();
        owner = $(
          $(".program-broadcaster-name")
            .find("a")
            .get(0)
        ).text();
        break;
      case "MODERN_CAST_PAGE":
        title = $("span[class^='___broadcaster___'] a")
          .first()
          .text();
        owner = $("a[class^='___social-group-anchor___']").text();
        break;
      default:
    }
    Storage.saveToNestedLocalStorage("autoEnterCommunityList", id, {
      state: "init",
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
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
            {this.state.isToggledOn
              ? `${this._label}オン`
              : `${this._label}オフ`}
          </a>
        </OverlayTrigger>
      </span>
    );
  }
}

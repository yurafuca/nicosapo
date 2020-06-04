import $ from "jquery";

export default class PageType {
  static get() {
    let pageType = null;

    if ($("#Error_Box").length > 0) {
      return "ERROR_PAGE";
    }

    /**
     * TimeShiftPage
     */
    if (this._isModernTimeShiftPage()) {
      pageType = "MODERN_TIME_SHIFT_PAGE";
      /**
       * CastPages
       */
    } else if (this._isOfficialCastPage()) {
      pageType = "OFFICIAL_CAST_PAGE";
    } else if (this._isModernCastPage()) {
      pageType = "MODERN_CAST_PAGE";
    } else if (this._isCommunityPage()) {
      pageType = "COMMUNITY_PAGE";
    } else if (this._isChannelPage()) {
      pageType = "CHANNEL_PAGE";
    } else if (this._isUserPage()) {
      pageType = "USER_PAGE";
    } else {
      pageType = "ERROR_PAGE";
    }

    console.log(pageType);

    return pageType;
  }

  static _isModernCastPage() {
    const $root = $("#root");
    if ($root.length > 0) {
      return true;
    } else {
      return false;
    }
    // const re = /https\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
    // const url = window.location.href;
    // return url.match(re);
  }

  static _isChimeraCastPage() {
    const $targetDom = $("#player-block");
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
    // const re = /https\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
    // const url = window.location.href;
    // return url.match(re);
  }

  static _isModernTimeShiftPage() {
    // コメントが無効
    return document.querySelector("[class^=___video-layer__]") != null && document.querySelector("span[class^='___disabled-message___']") != null;
  }

  static _isOfficialCastPage() {
    return document.querySelector("[class^=___group-name-anchor___]") == null && document.querySelector("[class^=___video-layer__]") != null;
  }

  // TODO: 自身の生放送中に判定が正しくなくなる
  static _isNormalCastPage() {
    const zappingBox = document.getElementById("watch_zapping_box");
    const normalBroadCastArea = document.getElementById("nicolivebroadcaster_container");
    const modernBroadCastArea = document.getElementById("program-provider-block");
    if (zappingBox != null) return true;
    if (normalBroadCastArea != null) return true;
    if (modernBroadCastArea != null) return true;
    return false;
  }

  static _isStandByPage() {
    const flag = $("#gates").length === 0 && $(".gate_title").length > 0;
    return flag;
  }

  static _isGatePage() {
    const flag = $("#gates").length > 0;
    return flag;
  }

  static _isCommunityPage() {
    const $targetDom = $("table.communityDetail");
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  static _isChannelPage() {
    const $targetDom = $("body#channel_top");
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  static _isUserPage() {
    return window.location.href.startsWith('https://www.nicovideo.jp/user/')
  }
}

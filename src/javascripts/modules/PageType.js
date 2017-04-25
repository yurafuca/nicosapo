import $ from 'jquery'

export default class PageType {
  static get() {
    let pageType = null;

    /**
     * CastPages
     */
    if (this._isModernCastPage()) {
      pageType = 'MODERN_CAST_PAGE';
    } else if (this._isOfficialCastPage()) {
      pageType = 'OFFICIAL_CAST_PAGE';
    } else if (this._isNormalCastPage()) {
      pageType = 'NORMAL_CAST_PAGE';
    /**
     * NonCastPages
     */
    } else if (this._isStandByPage()) {
      pageType = 'STAND_BY_PAGE';
    } else if (this._isGatePage()) {
      pageType = 'GATE_PAGE';
    } else if (this._isCommunityPage()) {
      pageType = 'COMMUNITY_PAGE';
    } else if (this._isChannelPage()) {
      pageType = 'CHANNEL_PAGE';
    /**
     * TimeShiftPage
     */
    } else {
      pageType = 'TIME_SHIFT_PAGE';
    }

    console.log(pageType);

    return pageType;
  }

  static _isModernCastPage() {
    const re = /http:\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
    const url = window.location.href;
    return url.match(re);
  }

  static _isOfficialCastPage() {
    const $targetDom = $('#page.official');
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: 自身の生放送中に判定が正しくなくなる
  static _isNormalCastPage() {
    const zappingBox = document.getElementById('watch_zapping_box');
    const normalBroadCastArea = document.getElementById('nicolivebroadcaster_container');
    const modernBroadCastArea = document.getElementById('program-provider-block');
    if (zappingBox != null) return true;
    if (normalBroadCastArea != null) return true;
    if (modernBroadCastArea != null) return true;
    return false;
  }

  static _isStandByPage() {
    const flag = ($('#gates').length === 0) && ($('.gate_title').length > 0);
    return flag;
  }

  static _isGatePage() {
    const flag = $('#gates').length > 0;
    return flag;
  }

  static _isCommunityPage() {
    const $targetDom = $('table.communityDetail');
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  static _isChannelPage() {
    const $targetDom = $('body#channel_top');
    if ($targetDom.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}

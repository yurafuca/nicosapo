import $ from "jquery";
import MetaData from './MetaData';

function getLiveId() {
  const url = $('meta[property="og:url"]').attr("content");
  const re = /https?:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;

  if (re.exec(url)) {
    let liveId = `lv${re.exec(url)[1]}`;
    return liveId;
  }

  return null;
}

function getCommunityId() {
  const communityUrl1 = document.querySelector('[class^=___group-name-anchor___]');
  const re1 = /.+((ch|co)[0-9]+)/;

  // ユーザ放送
  if (re1.exec(communityUrl1)) {
    const communityId = re1.exec(communityUrl1)[1];
    return communityId;
  }

  const communityUrl2 = document.querySelector('[class^=___channel-name-anchor___]');
  const re2 = /https?:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;

  // チャンネル放送/公式放送
  if (communityUrl2 != null && re2.exec(communityUrl2)) {
    const communityId = re2.exec(communityUrl2)[3];
    return communityId;
  }

  const communityUrl3 = window.location.href;
  const re3 = /https?:\/\/com\.nicovideo\.jp\/community\/(co[0-9]+)/;

  // コミュニティページ
  if (re3.exec(communityUrl3)) {
    const communityId = re3.exec(communityUrl3)[1];
    return communityId;
  }

  const communityHref = $(".thumb_wrapper_ch > a").attr("href");

  // チャンネルページ
  if (communityHref) {
    const communityId = communityHref.replace("/", "");
    return communityId;
  }

  const img = document.querySelector("img.bd") || {};
  const url = img.src || "";
  const result = /\/((ch|co)\d+)\.jpg/.exec(url);
  if (result) {
    return result[1];
  }

  return null;
}

export default class IdHolder {
  constructor() {
    this.liveId = getLiveId();
    this.communityId = getCommunityId();
    console.info(this.liveId, this.communityId)
  }
}

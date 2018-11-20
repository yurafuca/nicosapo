import $ from "jquery";

function getLiveId() {
  const url = $('meta[property="og:url"]').attr("content");
  const re = /https:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;

  if (re.exec(url)) {
    let liveId = `lv${re.exec(url)[1]}`;
    return liveId;
  }

  return null;
}

function getCommunityId() {
  const communityUrl1 = $('meta[property="og:image"]').attr("content");
  const re1 = /.+((ch|co)[0-9]+)\.jpg.*/;

  // ユーザ放送
  if (re1.exec(communityUrl1)) {
    const communityId = re1.exec(communityUrl1)[1];
    return communityId;
  }

  const communityUrl2 = $("a.ch_name").attr("href");
  const re2 = /http:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;

  // チャンネル放送/公式放送
  if (re2.exec(communityUrl2)) {
    const communityId = re2.exec(communityUrl2)[3];
    return communityId;
  }

  const communityUrl3 = window.location.href;
  const re3 = /http:\/\/com\.nicovideo\.jp\/community\/(co[0-9]+)/;

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

  return null;
}

export default class IdHolder {
  constructor() {
    this.liveId = getLiveId();
    this.communityId = getCommunityId();
  }
}

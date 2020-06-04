import $ from "jquery";
import React from "react";
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";

export default class MetaData {
  static get() {
    const idHolder = new IdHolder();
    const id = idHolder.communityId;
    let thumbnail = $('meta[property="og:image"]').attr("content");
    if (id != null) {
      if (id.startsWith("co")) {
        thumbnail =
          "https://secure-dcdn.cdn.nimg.jp/comch/community-icon/128x128/" +
          id +
          ".jpg";
      } else {
        thumbnail = `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(id/10000)}/${id}.jpg`;
      }
    }
    const pageType = PageType.get();
    let openDate = null;
    let title, owner;
    switch (pageType) {
      case "USER_PAGE":
        title = document.querySelector('.profile h2').textContent.replace('さん', '');
        owner = document.querySelector('.profile h2').textContent.replace('さん', '');
        break;
      case "COMMUNITY_PAGE":
        title = document.querySelector('.communityDetail .content').innerText;
        owner = document.querySelector('.communityDetail .content').innerText;
        break;
      case "CHANNEL_PAGE":
        title = $("h3.cp_chname").text();
        owner = $("p.cp_viewname").text();
        break;
      case "NORMAL_CAST_PAGE": // PAIR A
      case "OFFICIAL_CAST_PAGE": // PAIR A
        title = $("[class^='___title___']").text();
        owner = $("[class^='___channel-name-anchor___']").text();
        break;
      case "MODERN_CAST_PAGE":
        title = document.querySelector(".name").textContent;
        owner = document.querySelector(".name").textContent;
        break;
      default:
    }
    const a = {
      communityId: id,
      programId: idHolder.liveId,
      pageType: pageType,
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    };
    console.log(a);
    return a;
  }
}
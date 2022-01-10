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
        thumbnail =
          "https://secure-dcdn.cdn.nimg.jp/comch/channel-icon/128x128/" +
          id +
          ".jpg";
      }
    }
    const pageType = PageType.get();
    let openDate = null;
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
        title = $("[class^='___title___']").text();
        owner = $("[class^='___channel-name-anchor___']").text();
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
        title = $("[class^='___name-label__']").text();
        owner = $("[class^='___user-name__ > name']").text();
        break;
      case "STANDBY_PAGE":
        title = $('meta[property="og:title"]').attr("content");
        owner = $("[class^='___supplier-name__']").text();
        openDate = $("[class^='___broadcast_time__']").attr("datetime");
        break;
      case "GATE_PAGE":
        title = $('meta[property="og:title"]').attr("content");
        openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content");
        owner = null;
        break;
      default:
    }
    return {
      communityId: id,
      programId: idHolder.liveId,
      pageType: pageType,
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    }
  }
}
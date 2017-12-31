import $ from "jquery";
import VideoInfo from "../modules/VideoInfo";

export default class VIParser {
  static parse(element) {
    const videoProps = VIParser._videoProps(element);
    const communityProps = VIParser._communityProps(element);
    const videoInfo = new VideoInfo();
    videoInfo.video().set("title", videoProps.title);
    videoInfo.video().set("id", videoProps.id);
    videoInfo.video().set("openTimeJp", videoProps.openTimeJp);
    videoInfo.video().set("isReserved", element.is_reserved);
    videoInfo.community().set("id", communityProps.id.replace(/(co|ch)/, ""));
    videoInfo.community().set("thumbnail", communityProps.thumbnail);
    return videoInfo.xml();
  }

  static _videoProps(element) {
    const $target = $(element)
      .find("a")
      .first();
    const video = {
      title: $target.attr("title"),
      url: $target.attr("href"),
      id: $target.attr("href").match(/(lv\d+)/g)[0],
      openTimeJp: $(element)
        .find("strong")
        .first()
        .text()
    };
    return video;
  }

  static _communityProps(element) {
    const $target = $($(element).find("img")[0]);
    const community = {
      url: $target
        .attr("src")
        .match(/http\:\/\/icon.nimg.jp\/(channel|community)\//)[0],
      id: $target.attr("src").match(/(ch|co)\d+/)[0],
      thumbnail: ""
    };
    community.thumbnail = `${community.url}${community.id}.jpg`;
    return community;
  }
}

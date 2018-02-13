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
    const id = $target.attr("src").match(/(ch|co)\d+/)[0];
    const base = `https://secure-dcdn.cdn.nimg.jp/comch`;
    const dir = id.startsWith("co") ? `community-icon` : `channel-icon`;
    const size = `128x128`;
    const community = {
      // url: `https://secure-dcdn.cdn.nimg.jp/comch/channel-icon/128x128/`,
      id: id,
      thumbnail: `${base}/${dir}/${size}/${id}.jpg`
    };
    return community;
  }
}

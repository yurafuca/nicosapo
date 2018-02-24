import $ from "jquery";
import VideoInfo from "../modules/VideoInfo";

export default class VIParser {
  static parse(element) {
    // const videoProps = VIParser._videoProps(element);
    // const communityProps = VIParser._communityProps(element);
    const videoInfo = new VideoInfo();
    videoInfo.video().set("title", element.title);
    videoInfo.video().set("id", `lv${element.id}`);
    videoInfo.video().set("openTimeJp", element.start_time);
    videoInfo.video().set("isReserved", element.is_reserved);
    videoInfo
      .community()
      .set("id", element.thumbnail_url.match(/(ch|co)\d+/)[0]);
    videoInfo.community().set("thumbnail", element.thumbnail_url);
    return videoInfo.xml();
  }
}

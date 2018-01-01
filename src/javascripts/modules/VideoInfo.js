import $ from "jquery";
import Video from "../modules/Video";
import Community from "../modules/Community";

export default class VideoInfo {
  constructor() {
    this._video = new Video();
    this._community = new Community();
  }

  video() {
    return this._video;
  }

  community() {
    return this._community;
  }

  xml() {
    const xml = $(this._xml());
    xml.append(this._video.xml());
    xml.append(this._community.xml());
    return xml;
  }

  _xml() {
    return `<video_info></video_info>`;
  }
}

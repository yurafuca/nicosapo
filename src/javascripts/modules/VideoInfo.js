// import $ from "jquery";
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
    // const xml = $(this._xml());
    const parser = new DOMParser();
    const xml = parser.parseFromString(this._xml(), "text/xml");
    const root = xml.documentElement;
    const foo = this._video.xml();
    root.appendChild(this._video.xml());
    root.appendChild(this._community.xml());
    return root;
  }

  _xml() {
    return `<video_info></video_info>`;
  }
}

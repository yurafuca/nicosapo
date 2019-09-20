import VideoInfo from "../modules/VideoInfo";

export default class VIParser {
  static parse(element) {
    const videoInfo = new VideoInfo();

    const videoElement = element.querySelector("a");

    const video = {
      title: videoElement.title,
      id: videoElement.href.match(/(lv\d+)/g)[0],
      start_time: element.querySelector("strong").textContent,
      is_reserved: element.is_reserved
    };

    const providerElement = element.querySelector("img");

    const provider = {
      id: providerElement.src.match(/\/.+\.jpg/)[0].replace(".jpg", ""),
      thumbnail: providerElement.src.replace("64x64", "128x128")
    };

    videoInfo.video().set("title", video.title);
    videoInfo.video().set("id", video.id);
    videoInfo.video().set("openTimeJp", video.start_time);
    videoInfo.video().set("isReserved", video.is_reserved);

    videoInfo.community().set("id", provider.id);
    videoInfo.community().set("thumbnail", provider.thumbnail);

    return videoInfo.xml();
  }
}

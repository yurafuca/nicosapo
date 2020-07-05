import VideoInfo from "./VideoInfo";

export default class FollowApiResponseParser {
  static parse(program) {
    const videoInfo = new VideoInfo();

    videoInfo.video().set("title", program.title);
    videoInfo.video().set("id", program.id);
    videoInfo.video().set("openTimeJp", program.beginAt / 1000);
    // フォロー中 API から取得できるかつ放送前であれば予約中である.
    videoInfo.video().set("isReserved", program.liveCycle === "RELEASED");

    videoInfo.community().set("id", program.socialGroup.id);
    videoInfo.community().set("thumbnail", program.socialGroup.thumbnailUrl);

    return videoInfo.xml();
  }
}
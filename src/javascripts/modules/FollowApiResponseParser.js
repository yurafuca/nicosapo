import VideoInfo from "./VideoInfo";

export default class FollowApiResponseParser {
  static parse(program) {
    const videoInfo = new VideoInfo();

    videoInfo.video().set("title", program.title);
    videoInfo.video().set("id", program.id);
    videoInfo.video().set("openTimeJp", program.beginAt / 1000);
    // フォロー中 API から取得できるかつ放送前であれば予約中である.
    videoInfo.video().set("isReserved", program.liveCycle === "RELEASED");
    videoInfo.community().set("id", FollowApiResponseParser.getId(program));
    videoInfo.community().set("thumbnail", FollowApiResponseParser.getThumbnail(program));

    return videoInfo.xml();
  }

  static getId(program) {
    return program.socialGroup.id === "co0" ? program.programProvider.id : program.socialGroup.id;
  }

  static getThumbnail(program) {
    return program.socialGroup.id === "co0" ? program.programProvider.icon : program.socialGroup.thumbnailUrl;
  }
}
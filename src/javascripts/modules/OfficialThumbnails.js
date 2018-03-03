export default class OfficialThumbnails {
  static getParams(programs) {
    if (programs.length === 0) {
      const message = document.createElement("div");
      message.className = "message";
      message.textContent = "フォロー中の コミュニティ・チャンネル が放送している番組がありません．";
    }

    const thumbParams = [];
    programs.forEach((program, index) => {
      const thumbParam = {};
      const a = program.querySelector(".video_text a");
      let thumbnailUrl;
      if (a != null) {
        const communityId = a.href;
        const regexp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
        const resultarr = regexp.exec(communityId);
        thumbnailUrl = `http://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
      } else {
        thumbnailUrl = program.querySelector(".info a img").src;
      }
      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = program.querySelector(".video_title").textContent;
      thumbParam.id = `lv${program.querySelector(".video_id").textContent}`;
      thumbParam.url = `http://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      thumbParam.openTime = program.querySelector(".reserve") ? `20${program.querySelector(".time").textContent} 開場` : undefined;
      thumbParams.push(thumbParam);
    });
    return thumbParams;
  }
}

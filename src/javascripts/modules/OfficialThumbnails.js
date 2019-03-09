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
        thumbnailUrl = `https://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
      } else {
        thumbnailUrl = program.querySelector(".info a img").src;
      }
      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = program.querySelector(".video_title").textContent;
      thumbParam.id = `lv${program.querySelector(".video_id").textContent}`;
      thumbParam.url = `https://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      thumbParam.openTime = program.querySelector(".reserve") ? `20${program.querySelector(".time").textContent} 開場` : undefined;
      thumbParam.isReserved = program.querySelector(".reserve") != null;
      thumbParam.isOfficial = true;

      const dateJpnOrig = program.querySelector(".time").textContent;
      // => 未来の番組の場合 : 18年11月10日 
      // => 現在の番組の場合1: 37分
      // => 現在の番組の場合2: 1時間13分

      // 未来
      if (dateJpnOrig.includes('分')) {
        const splitted = dateJpnOrig.replace('時間', '分').split("分");
        // => ["1", "37"]

        // 1 時間未満
        if (splitted[1] === "") {
          const millisec = splitted[0] * 60 * 1000;
          const today = new Date();
          thumbParam.openDate = new Date(today.getTime() - millisec);
          // 1 時間以上
        } else {
          const millisec = splitted[0] * 3600 * 1000 + splitted[1] * 60 * 1000;
          const today = new Date();
          thumbParam.openDate = new Date(today.getTime() - millisec);
        }
        // 現在
      } else {
        const splitted = dateJpnOrig.split("年月日");
        // => ["18", "11", "10"]

        const year = `20${splitted[0]}`;
        // => 2018

        const month = splitted[1];
        // => 11

        const day = splitted[2];
        // => 10

        const date = new Date(`${year}-${month}-${day}`);
        // Date

        thumbParam.openDate = date;
      }


      thumbParam.startTime = program.querySelector(".time").textContent;
      thumbParams.push(thumbParam);
    });
    return thumbParams;
  }
}
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
      const a = program.querySelector("a.rk-ProgramCard_DetailChName");
      let thumbnailUrl;
      if (a != null) {
        const communityId = a.href;
        const regexp = /https\:\/\/ch.nicovideo.jp\/(.+)/;
        const resultarr = regexp.exec(communityId);
        thumbnailUrl = `https://icon.nimg.jp/channel/${resultarr[1]}.jpg`;
      } else {
        thumbnailUrl = program.querySelector(".info a img").src;
      }

      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = program.querySelector(".rk-ProgramCard_DetailTitle").textContent;
      thumbParam.id = `lv${program.querySelector(".video_id").textContent}`;
      thumbParam.url = `https://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      const isReserved = program.querySelector(".rk-ProgramCard_ReservationButton") != null;
      thumbParam.openTime = isReserved ? `${program.querySelector(".rk-ProgramCard_DetailTime").textContent} 開場` : undefined;
      thumbParam.isReserved = isReserved;
      thumbParam.isOfficial = true;

      const dateJpnOrig = program.querySelector(".rk-ProgramCard_DetailTime").textContent;
      // => 未来の番組の場合 : 2019/9/14 20:00
      // => 現在の番組の場合1: 37分経過
      // => 現在の番組の場合2: 1時間13分経過

      // 現在
      if (dateJpnOrig.includes('分')) {
        const splitted = dateJpnOrig.replace("経過", "").replace('時間', '分').split("分");
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
        // 未来
      } else {
        const splitted = dateJpnOrig.split(" /");
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


      thumbParam.startTime = program.querySelector(".rk-ProgramCard_DetailTime").textContent;
      thumbParams.push(thumbParam);
    });
    return thumbParams;
  }
}
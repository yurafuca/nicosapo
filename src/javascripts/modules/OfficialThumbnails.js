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
      const a = program.querySelector("[class^='___rk-program-card-detail-provider-name___']");
      let thumbnailUrl;
      if (a != null) {
        const communityId = a.href;
        const regexp = /https\:\/\/www.nicovideo.jp\/user\/(.+)\/(.+)/;
        const resultarr = regexp.exec(communityId);
        // const dir = 
        thumbnailUrl = `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${(Math.floor(resultarr[1] / 10000))}/${resultarr[1]}.jpg`
      } else {
        thumbnailUrl = program.querySelector(".info a img").src;
      }

      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = program.querySelector("[class^='___rk-program-card-detail-title___']").textContent;
      thumbParam.id = program.querySelector("[class^='___rk-program-card-detail-title___']").href.match(/(watch)\/(lv[0-9]+).*/)[2];
      thumbParam.url = `https://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      const isReserved = program.querySelector("[class^='___timeshift-reserved-count___']") != null;
      thumbParam.openTime = isReserved ? `${program.querySelector("[class^='___rk-program-card-detail-time']").textContent} 開場` : undefined;
      thumbParam.isReserved = isReserved;
      thumbParam.isOfficial = true;

      const dateJpnOrig = program.querySelector("[class^='___rk-program-card-detail-time']").textContent;
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


      thumbParam.startTime = program.querySelector("[class^='___rk-program-card-detail-time']").textContent;
      thumbParams.push(thumbParam);
    });
    return thumbParams;
  }
}
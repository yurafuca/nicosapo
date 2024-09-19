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
      const thumbnailUrl = program.socialGroup.thumbnailUrl;

      thumbParam.background = `url('${thumbnailUrl}')`;
      thumbParam.title = program.title;
      thumbParam.id = program.id;
      thumbParam.url = `https://live.nicovideo.jp/watch/${thumbParam.id}`;
      thumbParam.text = thumbParam.title;
      thumbParam.index = index;
      const isReserved = program.liveCycle === "RELEASED";
      const d = new Date(program.beginAt);
      thumbParam.openTime = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} 開始`;
      thumbParam.isReserved = isReserved;
      thumbParam.isOfficial = true;
      thumbParam.openDate = d;
      thumbParam.startTime = thumbParam.openTime;

      thumbParam.commentCount = program.statistics.commentCount;
      thumbParam.watchCount = program.statistics.watchCount;
      thumbParam.reservationCount = program.statistics.reservationCount;
      
      thumbParams.push(thumbParam);
    });
    return thumbParams;
  }
}
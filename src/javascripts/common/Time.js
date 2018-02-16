export default class Time {
  static toJpnString(milisec) {
    const date = new Date(milisec);
    const days = Time.days();

    return (
      [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/") +
      " " +
      "(" +
      days[date.getDay()] +
      ") " +
      date.toLocaleTimeString()
    );
  }

  // 2018/02/02(月) 00:00
  static jpDateFormat(unixTime) {
    const days = ["日", "月", "火", "水", "木", "金", "土", "日"];
    const date = new Date(unixTime);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = ("0" + date.getHours()).slice(-2);
    const s = ("0" + date.getSeconds()).slice(-2);
    const w = days[date.getDay()];
    return `${y}/${m}/${d}(${w}) ${h}:${s}`;
  }

  static toJpnDay(milisec) {
    const days = Time.days();

    return days[new Date(milisec).getDay()];
  }

  static toUnixTime(milisec) {
    const days = Time.days();

    return days[new Date(milisec).getDay()];
  }

  static days() {
    const days = {
      0: "日",
      1: "月",
      2: "火",
      3: "水",
      4: "木",
      5: "金",
      6: "土"
    };

    return days;
  }

  static secondDistance(src, dst) {
    const deltaMillsecond = dst.getTime() - src.getTime();
    return parseInt(deltaMillsecond / 1000);
  }

  static secondSurplusDistance(src, dst) {
    const secDist = Time.secondDistance(src, dst);
    return parseInt(secDist % 60);
  }

  static minuteDistance(src, dst) {
    const deltaMillsecond = dst.getTime() - src.getTime();
    return parseInt(deltaMillsecond / 1000 / 60);
  }

  static minuteSurplusDistance(src, dst) {
    const secDist = Time.minuteDistance(src, dst);
    return parseInt((secDist % 60) % 60);
  }

  static hourDistance(src, dst) {
    const deltaMillsecond = dst.getTime() - src.getTime();
    return parseInt(deltaMillsecond / 1000 / 60 / 60);
  }
}

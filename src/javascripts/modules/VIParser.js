import moment from 'moment';
import VideoInfo from "../modules/VideoInfo";

export default class VIParser {
  static parse(element) {
    const videoInfo = new VideoInfo();

    const video = {
      title: element.querySelector("[class^='___program-title___']").textContent,
      id: element.querySelector("[class^='___program-title___'] a").href.match(/(lv\d+)/g)[0],
      is_reserved: element.querySelector("[class^='___status___']").dataset.statusType === "comingsoon"
    };

    //aa

    const providerPageUrl = element.querySelector("[class^='___program-provider-summary___']").href;
    const providerId = providerPageUrl.split('/').pop().replace(/\.jpg.*/, "");
    let thumbnail;
    if (!providerId.startsWith("ch")) {
      thumbnail = `https://secure-dcdn.cdn.nimg.jp/nicoaccount/usericon/${Math.floor(providerId/10000)}/${providerId}.jpg`;
    } else {
      thumbnail = `https://secure-dcdn.cdn.nimg.jp/comch/channel-icon/128x128/${providerId}.jpg`;
    }

    const provider = {
      id: providerId,
      thumbnail: thumbnail
    };

    let unixTime;

    const duration = element.querySelector("[class^='___duration___']");
    if (duration != null) {
      const words = duration.textContent.replace(/(時間|分|経過)/g, ',')
        .split(',')
        .filter(word => word.length !== 0);
      let h, m;

      if (words.length === 1) {
        h = 0;
        m = words[0];
      } else {
        h = words[0];
        m = words[1];
      }

      moment.locale('jp');
      unixTime = moment().subtract(h, 'hours').subtract(m, 'minutes').unix();
    } else {
      moment.locale('jp');
      unixTime = moment(element.querySelector("[class^='___start-at___']").dateTime).unix();
    }

    videoInfo.video().set("title", video.title);
    videoInfo.video().set("id", video.id);
    videoInfo.video().set("openTimeJp", unixTime);
    videoInfo.video().set("isReserved", video.is_reserved); // => "2018/03/13 18:00"

    videoInfo.community().set("id", provider.id);
    videoInfo.community().set("thumbnail", provider.thumbnail);

    return videoInfo.xml();
  }
}

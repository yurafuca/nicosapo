import $ from 'jquery'

export default class videoInfoUtil {
  static isReserved(videoInfo) {
    const isReserved = $(videoInfo).find('video is_reserved').text();
    return !(isReserved === 'true');
  }

  static removeReservation($videoInfoList) {
    const result = $videoInfoList.filter(videoInfoUtil.isReserved);
    return result;
  }
}

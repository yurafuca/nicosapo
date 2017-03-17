import $ from 'jquery'
import { parseString } from 'xml2js'
import VideoInfo from '../modules/VideoInfo'

const parameter_nicovideojs = [];

export default class Api {
  static isLogined() {
    return new Promise((resolve, reject) => {
      const endpoint = 'http://www.nicovideo.jp/api/mylistgroup/list';
      $.post(endpoint, (response) => {
        const status = $(response).attr('status');
        switch (status) {
        case 'ok':
          resolve(true);
          break;
        case 'fail':
          reject(false);
          break;
        }
      }, 'json');
    });
  }

  static loadCasts(liveType) {
    return new Promise((resolve, reject) => {
      switch(liveType) {
        case 'user':
          Api.getUserOnair().then(($videoInfos) => {
            console.info($videoInfos);
            resolve($videoInfos);
          }).catch(reject);
          break;
        case 'official':
          Api.getOfficialOnair().then((official_lives) => {
            resolve(official_lives);
          });
          break
        case 'future':
          Api.getFutureOnair().then((future_lives) => {
              resolve(future_lives);
          });
          break;
      }
    });
  }

  // jQuery オブジェクトでなく JSON を返したい
  static getUserOnair() {
    return new Promise((resolve) => {
      const endpoint = 'http://live.nicovideo.jp/my';
      $.post(endpoint, (response) => {
        const $html = $(response);
        const subscribes = $html.find("[id$=subscribeItemsWrap] > .liveItems > [class^='liveItem']");
        const reserved = $html.find("[id$=subscribeReservedItemsWrap] > .liveItems > [class^='liveItem']");
        $.each($(reserved), (index, item) => {
          item.is_reserved = true;
        });
        $.merge(subscribes, reserved);
        const videoInfos = [];
        $.each($(subscribes), (index, item) => {
          const video_title = $(item).find('a').first().attr('title');
          const video_url = $(item).find('a').first().attr('href');
          const video_id = video_url.match(/(lv\d+)/g)[0];
          const img = $($(item).find('img')[0]);
          if (img.attr('alt') == 'CLOSED') {
            return;
          }
          const community_thumbnail_base = img.attr('src').match(/http\:\/\/icon.nimg.jp\/(channel|community)\//)[0];
          const community_id = img.attr('src').match(/(ch|co)\d+/)[0];
          const community_thumbnail = `${community_thumbnail_base}${community_id}.jpg`;
          const video_open_time_jpstr = $(item).find('strong').first().text();
          const videoInfo = $(VideoInfo.getString());
          videoInfo.find('community thumbnail').text(community_thumbnail);
          videoInfo.find('video title').text(video_title);
          videoInfo.find('video id').text(video_id);
          videoInfo.find('video open_time_jpstr').text(video_open_time_jpstr);
          videoInfo.find('community id').text(community_id.replace(/(co|ch)/, ''));
          if (item.is_reserved) {
            videoInfo.find('video is_reserved').text(true);
          } else {
            videoInfo.find('video is_reserved').text(false);
          }
          videoInfos.push(videoInfo);
        });
        resolve(videoInfos);
      });
    });
  }

  static getCheckList() {
    return new Promise((resolve, reject) => {
      const endpoint = "http://flapi.nicovideo.jp/api/getchecklist";
      const posting = $.get(endpoint);
      posting.done((data) => {
        const json = JSON.parse(data);
        const status = json.status;
        switch (status) {
        case "OK":
          resolve(json.community_id);
          break;
        default:
          reject(new Error('Request failed: status is "fail".'));
          break;
        }
      });
    });
  }

  static getFutureOnair() {
    return new Promise((resolve) => {
      const endpoint = "http://live.nicovideo.jp/ranking?type=comingsoon&main_provider_type=official";
      const posting = $.get(endpoint);
      posting.done((response) => {
        const future_lives = $(response).find('.ranking_video');
        if (future_lives) {
          resolve(future_lives.toArray());
        }
      });
    });
  }

  static getOfficialOnair() {
    return new Promise((resolve) => {
      const endpoint = "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
      const posting = $.get(endpoint);
      posting.done((response) => {
        const official_lives = $(response).find('.ranking_video');
        resolve(official_lives.toArray());
      });
    });
  }

  static getStatus(param) {
    parameter_nicovideojs.push(param);
    return new Promise((resolve) => {
      const endpoint = 'http://watch.live.nicovideo.jp/api/getplayerstatus?v=';
      const parameter = parameter_nicovideojs.shift();
      $.get(endpoint + param, (response) => {
        response.param = parameter;
        resolve(response);
      });
    });
  }

  /**
   * @param <string> requestId apiに渡すパラメータ
   *   e.g. 'lv9999999', 'co9999999', 'ch9999999'
   */
  static isOpen(requestId) {
    const theRequestId = requestId;
    return new Promise((resolve) => {
      Api.getStatus(requestId).then((response) => {
        const errorCode = $(response).find('error code').text();
        if (!errorCode || (errorCode === 'require_community_member')) {
          const $response = $(response);
          const endTime = $response.find('end_time').text();
          if (Date.now() < `${endTime}000`) {
            console.log(`${theRequestId} is ONAIR`);
            const liveId = $response.find('stream id').text();
            response.nextLiveId = liveId;
            response.isOpen = true;
          }
        } else {
          console.log(`${theRequestId} is OFFAIR or ERROR`);
          response.isOpen = false;
        }
        response.requestId = theRequestId;
        resolve(response);
      });
    });
  }
}

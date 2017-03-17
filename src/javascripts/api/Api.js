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
        const videoInfoList = [];
        $.each($(subscribes), (index, item) => {
          const videoProps     = Api._videoProps(item);
          const communityProps = Api._communityProps(item);
          const extProps       = Api._extProps(item);
          if (extProps.isClosed) {
            return;
          }
          const videoInfo = $(VideoInfo.getString());
          videoInfo.find('video title').text(videoProps.title);
          videoInfo.find('video id').text(videoProps.id);
          console.info(videoProps.openTimeJp);
          videoInfo.find('video open_time_jpstr').text(videoProps.openTimeJp);
          videoInfo.find('community id').text(communityProps.id.replace(/(co|ch)/, ''));
          videoInfo.find('community thumbnail').text(communityProps.thumbnail);
          if (item.is_reserved) {
            videoInfo.find('video is_reserved').text(true);
          } else {
            videoInfo.find('video is_reserved').text(false);
          }
          videoInfoList.push(videoInfo);
        });
        resolve(videoInfoList);
      });
    });
  }

  static _videoProps(element) {
    const $target = $(element).find('a').first();
    const video = {
      title:      $target.attr('title'),
      url:        $target.attr('href'),
      id:         $target.attr('href').match(/(lv\d+)/g)[0],
      openTimeJp: $(element).find('strong').first().text(),
    };
    return video;
  }

  static _communityProps(element) {
    const $target = $($(element).find('img')[0]);
    const community = {
      url:       $target.attr('src').match(/http\:\/\/icon.nimg.jp\/(channel|community)\//)[0],
      id:        $target.attr('src').match(/(ch|co)\d+/)[0],
      thumbnail: '',
    };
    community.thumbnail = `${community.url}${community.id}.jpg`;
    return community;
  }

  static _extProps(element) {
    const $target = $($(element).find('img')[0]);
    const ext = {
      isClosed:   $target.attr('alt') === 'CLOSED',
    };
    return ext;
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

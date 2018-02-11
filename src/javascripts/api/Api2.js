import $ from "jquery";
import axios from "axios";
import Common from "../common/Common";
// import VIParser from "../modules/VIParser";

const parameter_nicovideojs = [];

export default class Api2 {
  static isLogined() {
    return new Promise((resolve, reject) => {
      Api2.loadCasts("user")
        .then(programs => {
          resolve(true);
        })
        .catch(() => {
          reject(false);
        });
    });
  }

  static loadCasts(liveType) {
    return new Promise((resolve, reject) => {
      switch (liveType) {
        case "user":
          Api2.getUserOnair()
            .then($videoInfos => {
              resolve($videoInfos);
            })
            .catch(reject);
          break;
        case "official":
          Api2.getOfficialOnair().then(official_lives => {
            resolve(official_lives);
          });
          break;
        case "future":
          Api2.getFutureOnair().then(future_lives => {
            resolve(future_lives);
          });
          break;
      }
    });
  }

  static fetchFavorites(type = "all") {
    // http://sp.live.nicovideo.jp/api/favorite?firstStreamNum=1&streamMany=100&streamType=all

    const base = "http://sp.live.nicovideo.jp/api/favorite";

    const request = axios.get(base, {
      params: {
        firstStreamNum: 1,
        streamMany: 100,
        streamType: type // "all", "onair", "comingsoon"
      }
    });

    return request
      .then(response => {
        if (response.data.status === "fail") throw new Error("failed.");
        else return response.data;
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }

  static formatFavorites(streams) {
    return streams.map((stream, i) => {
      const date = new Date(stream.start_time);
      const base = "http://live.nicovideo.jp/watch/";

      return {
        key: stream.id,
        preload: i == 0,
        background: stream.thumbnail_url,
        title: stream.title,
        url: `${base}lv${stream.id}`,
        id: stream.id,
        isReserved: stream.is_product,
        text: stream.title,
        day: Common.jpDay(date.getDay()),
        openTime: stream.start_time,
        index: i
      };
    });
  }

  static getCheckList() {
    return new Promise((resolve, reject) => {
      const endpoint = "http://flapi.nicovideo.jp/api/getchecklist";
      const posting = $.get(endpoint);
      posting.done(data => {
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
    return new Promise(resolve => {
      const endpoint =
        "http://live.nicovideo.jp/ranking?type=comingsoon&main_provider_type=official";
      const posting = $.get(endpoint);
      posting.done(response => {
        const future_lives = $(response).find(".ranking_video");
        if (future_lives) {
          resolve(future_lives.toArray());
        }
      });
    });
  }

  static getOfficialOnair() {
    return new Promise(resolve => {
      const endpoint =
        "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
      const posting = $.get(endpoint);
      posting.done(response => {
        const official_lives = $(response).find(".ranking_video");
        resolve(official_lives.toArray());
      });
    });
  }

  static getStatus(param) {
    parameter_nicovideojs.push(param);
    return new Promise(resolve => {
      const endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
      const parameter = parameter_nicovideojs.shift();
      $.get(endpoint + param, response => {
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
    return new Promise(resolve => {
      Api2.getStatus(requestId).then(response => {
        const $response = $(response);
        const errorCode = $response.find("error code").text();
        if (errorCode) {
          if (errorCode !== "require_community_member") {
            console.log(`${theRequestId} is OFFAIR or ERROR`);
            response.isOpen = false;
          }
        }
        const endTime = $response.find("end_time").text();
        if (Date.now() < `${endTime}000`) {
          console.log(`${theRequestId} is ONAIR`);
          const liveId = $response.find("stream id").text();
          response.nextLiveId = liveId;
          response.isOpen = true;
        }
        response.requestId = theRequestId;
        resolve(response);
      });
    });
  }

  static search(query, sortMode) {
    return new Promise(resolve => {
      const sortModes = {
        "startTime-dsc": "startTime",
        "startTime-asc": "%2bstartTime",
        "viewCounter-dsc": "viewCounter",
        "viewCounter-asc": "%2bviewCounter",
        "commentCounter-dsc": "commentCounter",
        "commentCounter-asc": "%2bcommentCounter"
      };
      const q =
        `http://api.search.nicovideo.jp/api/v2/live/contents/search?q=${query}` +
        "&targets=tags" +
        "&fields=contentId,title,communityIcon,description,start_time,live_end_time,comment_counter,score_timeshift_reserved,provider_type,tags,member_only,viewCounter,timeshift_enabled" +
        "&_context=nicosapo" +
        "&filters%5BliveStatus%5D%5B0%5D=onair" +
        "&filters%5BstartTime%5D%5Bgte%5D=2017-05-18T00:00:00-09:00" +
        "&filters%5BstartTime%5D%5Blt%5D=2030-04-01T00:00:00-09:00" +
        `&_sort=${sortModes[sortMode]}` +
        "&_limit=100";
      $.get(q, response => {
        console.info(response);
        resolve(response);
      });
    });
  }

  static getFollowingCommunities(pageNum) {
    const parser = httpResponse => {
      const result = [];
      const $frame = $($(httpResponse).find(".com_frm"));
      $.each($frame, (i, element) => {
        const $e = $(element);
        const title = $e.find(`.title`).text();
        const thumbnail = $e.find(".thmb img").attr(`src`);
        const id = $e
          .find(`.thmb a`)
          .attr(`href`)
          .replace("/community/", ``);
        const url = `http://com.nicovideo.jp/community/${id}`;
        const community = {
          title: title,
          thumbnail: thumbnail,
          id: id,
          url: url
        };
        result.push(community);
      });
      return result;
    };
    return new Promise(resolve => {
      const endpoint = `http://com.nicovideo.jp/community`;
      const query = `?page=${pageNum}`;
      $.get(endpoint + query, response => {
        const parsedResponse = parser(response);
        resolve(parsedResponse);
      });
    });
  }
}

import axios from "axios";
import { parseString } from "xml2js";
import VIParser from "../modules/VIParser";

const parameter_nicovideojs = [];

export default class Api {
  static isLogined() {
    return new Promise((resolve, reject) => {
      Api.loadCasts("user")
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
          Api.getUserOnair()
            .then($videoInfos => {
              resolve($videoInfos);
            })
            .catch(reject);
          break;
        case "official":
          Api.getOfficialOnair().then(official_lives => {
            resolve(official_lives);
          });
          break;
        case "future":
          Api.getFutureOnair().then(future_lives => {
            resolve(future_lives);
          });
          break;
      }
    });
  }

  // jQuery オブジェクトでなく JSON を返したい
  static getUserOnair() {
    return new Promise((resolve, reject) => {
      const url = " https://live.nicovideo.jp/my";

      axios
        .get(url)
        .then(response => {
          const parser = new DOMParser();
          const html = parser.parseFromString(response.data, "text/html");

          const onairSelector = "[id$=subscribeItemsWrap] > .liveItems > [class^='liveItem']";
          const onairStreams = html.querySelectorAll(onairSelector);

          const reservedSelector = "[id$=subscribeReservedItemsWrap] > .liveItems > [class^='liveItem']";
          const reservedStreams = html.querySelectorAll(reservedSelector);

          const onairStreamList = onairStreams;
          const reservedStreamList = [...reservedStreams].map(stream => {
            stream.is_reserved = true;
            return stream;
          });

          const allStreamList = [...onairStreamList].concat([...reservedStreamList]);
          const videoInfoList = allStreamList.map(stream => VIParser.parse(stream));

          resolve(videoInfoList);
        })
        .catch(error => {
          throw error;
        });
    });
  }

  static getFutureOnair() {
    return new Promise(resolve => {
      const url = "https://live.nicovideo.jp/ranking?type=comingsoon&main_provider_type=official";
      axios.get(url).then(response => {
        const parser = new DOMParser();
        const html = parser.parseFromString(response.data, "text/html");
        const futureStreams = html.querySelectorAll(".ranking_video");
        if (futureStreams) {
          resolve(futureStreams);
        }
      });
    });
  }

  static getOfficialOnair() {
    return new Promise(resolve => {
      const url = "https://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
      axios.get(url).then(response => {
        const parser = new DOMParser();
        const html = parser.parseFromString(response.data, "text/html");
        const officialStreams = html.querySelectorAll(".ranking_video");
        resolve(officialStreams);
      });
    });
  }

  static getStatus(param) {
    parameter_nicovideojs.push(param);
    return new Promise(resolve => {
      const url = "https://live.nicovideo.jp/api/getplayerstatus/";
      const parameter = parameter_nicovideojs.shift();

      axios
        .get(url + param)
        .then(response => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(response.data, "text/xml");
          doc.param = parameter;
          resolve(doc);
          // });
        })
        .catch(response => {
          response.data.param = parameter;
          resolve(response.data);
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
      Api.getStatus(requestId).then(response => {
        const errorCode = response.querySelector("error code");
        if (errorCode) {
          if (errorCode.textContent !== "require_community_member") {
            console.log(`${theRequestId}: offair.`);
            response.isOpen = false;
          }
        }

        const endTime = response.querySelector("end_time");
        if (endTime) {
          if (Date.now() < `${endTime.textContent}000`) {
            console.log(`${theRequestId}: onair.`);
            const liveId = response.querySelector("stream id").textContent;
            const title = response.querySelector("stream title").textContent;
            response.nextLiveId = liveId;
            response.title = title;
            response.isOpen = true;
          }
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
      const q = `https://api.search.nicovideo.jp/api/v2/live/contents/search?q=${query}` + "&targets=tags,title,description" + "&fields=contentId,title,communityIcon,description,start_time,live_end_time,comment_counter,score_timeshift_reserved,provider_type,tags,member_only,viewCounter,timeshift_enabled" + "&_context=nicosapo" + "&filters%5BliveStatus%5D%5B0%5D=onair" + `&_sort=${sortModes[sortMode]}` + "&_limit=100";
      axios.get(q).then(response => {
        resolve(response.data);
      });
    });
  }

  static getFollowingCommunities(pageNum) {
    const parser = httpResponse => {
      const result = [];
      const parser = new DOMParser();
      const html = parser.parseFromString(httpResponse, "text/html");
      const frames = html.querySelectorAll(".com_frm");

      Array.prototype.forEach.call(frames, el => {
        const title = el.querySelector(".title").textContent;
        const thumbnail = el.querySelector(".thmb img").src;
        const id = el.querySelector(".thmb a").href.replace("https://com.nicovideo.jp/community/", ``);
        const url = `https://com.nicovideo.jp/community/${id}`;
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
      const endpoint = `https://com.nicovideo.jp/community`;
      const query = `?page=${pageNum}`;
      axios.get(endpoint + query).then(response => {
        const parsedResponse = parser(response.data);
        resolve(parsedResponse);
      });
    });
  }

  static fetchVideoStatistics(id, source = "statistics", title = "") {
    let url = '';

    if (source === "statistics")
      url = `https://live2.nicovideo.jp/watch/${id}/statistics`;
    else if (source === "apiv2")
      url = `https://api.search.nicovideo.jp/api/v2/live/contents/search?q=${title}&targets=title&fields=contentId,title,viewCounter,commentCounter&filters[liveStatus][0]=onair&_sort=-viewCounter`;

    const request = axios.get(url);
    return request
      .then(response => {
        if (response.status !== 200)
          throw new Error("failed.");
        else
          return response;
      })
      .catch(error => {
        throw error;
      });
  }

  static fetchCommunityStatistics(distributorIdList) {
    const separator = ",";
    const joinedWith = distributorIdList.join(separator);
    const url = `https://api.ce.nicovideo.jp/api/v1/community.array?id=${joinedWith}`;
    return axios
      .get(url)
      .then(response => {
        if (response.status != 200) {
          throw new Error("request failed.");
        } else {
          let ret;
          parseString(response.data, (err, result) => {
            if (result.nicovideo_community_response.error != null) {
              ret = []
            } else {
              ret = result.nicovideo_community_response.community;
            }
          });
          return ret;
        }
      })
      .catch(error => {
        throw error;
      });
  }
}

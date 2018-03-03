import axios from "axios";
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
      const url = "http://sp.live.nicovideo.jp/api/favorite?firstStreamNum=1&streamMany=100&streamType=all";

      // axios.get("http://live.nicovideo.jp/my");

      axios
        .get(url)
        .then(response => {
          let favoriteStreams = response.data.favoriteStreams;
          favoriteStreams = favoriteStreams.map(stream => {
            stream.is_reserved = stream.start_time * 1000 > Date.now();
            return stream;
          });
          const videoInfoList = favoriteStreams.map(stream => VIParser.parse(stream));
          resolve(videoInfoList);
        })
        .catch(error => {
          throw error;
        });
    });
  }

  static getCheckList() {
    return new Promise((resolve, reject) => {
      const url = "http://flapi.nicovideo.jp/api/getchecklist";
      axios.get(url).then(response => {
        const status = response.data.status;
        switch (status) {
          case "OK":
            resolve(response.data.community_id);
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
      const url = "http://live.nicovideo.jp/ranking?type=comingsoon&main_provider_type=official";
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
      const url = "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
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
      const url = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
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
            response.nextLiveId = liveId;
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
      const q = `http://api.search.nicovideo.jp/api/v2/live/contents/search?q=${query}` + "&targets=tags,title,description" + "&fields=contentId,title,communityIcon,description,start_time,live_end_time,comment_counter,score_timeshift_reserved,provider_type,tags,member_only,viewCounter,timeshift_enabled" + "&_context=nicosapo" + "&filters%5BliveStatus%5D%5B0%5D=onair" + `&_sort=${sortModes[sortMode]}` + "&_limit=100";
      axios.get(q).then(response => {
        // console.info(response.data);
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
      // const $frame = $($(httpResponse).find(".com_frm"));

      // $.each($frame, (i, element) => {
      Array.prototype.forEach.call(frames, el => {
        // const $e = $(element);
        const title = el.querySelector(".title").textContent;
        // const title = $e.find(`.title`).text();
        const thumbnail = el.querySelector(".thmb img").src;
        // const thumbnail = $e.find(".thmb img").attr(`src`);
        const id = el.querySelector(".thmb a").href.replace("http://com.nicovideo.jp/community/", ``);
        // const id = $e
        // .find(`.thmb a`)
        // .attr(`href`)
        // .replace("/community/", ``);
        const url = `http://com.nicovideo.jp/community/${id}`;
        const community = {
          title: title,
          thumbnail: thumbnail,
          id: id,
          url: url
        };
        result.push(community);
      });
      // const $e = $(element);
      // const title = $e.find(`.title`).text();
      // const thumbnail = $e.find(".thmb img").attr(`src`);
      // const id = $e
      //   .find(`.thmb a`)
      //   .attr(`href`)
      //   .replace("/community/", ``);
      // const url = `http://com.nicovideo.jp/community/${id}`;
      // const community = {
      //   title: title,
      //   thumbnail: thumbnail,
      //   id: id,
      //   url: url
      // };
      // result.push(community);
      // });
      return result;
    };
    return new Promise(resolve => {
      const endpoint = `http://com.nicovideo.jp/community`;
      const query = `?page=${pageNum}`;
      axios.get(endpoint + query).then(response => {
        const parsedResponse = parser(response.data);
        resolve(parsedResponse);
      });
    });
  }

  // 公式チャンネル・ユーザーチャンネルのフィードを取得
  static fetchChannelFeed(type = "all") {
    const base = "http://live.nicovideo.jp/rss";

    const request = axios.get(base, {
      responseType: "xml",
      params: {
        firstStreamNum: 1,
        streamMany: 100,
        streamType: type // "all", "onair", "comingsoon",
      }
    });

    return request
      .then(response => {
        if (response.status !== 200) throw new Error("failed.");
        else return Api._toChannelList(response.data);
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }
}

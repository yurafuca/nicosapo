import axios from "axios";
import { parseString } from "xml2js";
import FollowApiResponseParser from "../modules/FollowApiResponseParser";

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
        case "reserve":
          Api.getUserFuture()
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
      const url = "https://live.nicovideo.jp/front/api/pages/follow/v1/programs?status=onair&offset=0";

      axios
        .get(url)
        .then(response => {
          resolve(response.data.data.programs.map(FollowApiResponseParser.parse));
        })
        .catch(error => {
          throw error;
        });
    });
  }


  // jQuery オブジェクトでなく JSON を返したい
  static getUserFuture() {
    return new Promise((resolve, reject) => {
      const url = "https://live.nicovideo.jp/front/api/pages/follow/v1/programs?status=comingsoon&offset=0";

      axios
        .get(url)
        .then(response => {
          resolve(response.data.data.programs.map(FollowApiResponseParser.parse));
        })
        .catch(error => {
          throw error;
        });
    });
  }


  static getFutureOnair() {
    return new Promise(resolve => {
      const url = "https://live.nicovideo.jp/ranking?type=comingsoon";
      axios.get(url).then(response => {
        const parser = new DOMParser();
        const html = parser.parseFromString(response.data, "text/html");
        const futureStreams = html.querySelectorAll("#official_and_channel_ranking_main .rk-ProgramCard");
        if (futureStreams) {
          resolve(futureStreams);
        }
      });
    });
  }

  static getOfficialOnair() {
    return new Promise(resolve => {
      const url = "https://live.nicovideo.jp/ranking?type=onair";
      axios.get(url).then(response => {
        const parser = new DOMParser();
        const html = parser.parseFromString(response.data, "text/html");
        const officialStreams = html.querySelectorAll("#official_and_channel_ranking_main .rk-ProgramCard");
        resolve(officialStreams);
      });
    });
  }

  static getProgramStatus(programId) {
    return new Promise(resolve => {
      axios
        .get(`https://live2.nicovideo.jp/unama/watch/${programId}/programinfo`)
        .then(response => {
          if (response.data.meta.status === 200) {
            resolve({
              programId: programId,
              title: response.data.data.title,
              status: response.data.data.status,
              beginAt: response.data.data.beginAt,
              endAt: response.data.data.endAt
            });
          }
          resolve({
            programId: programId,
            title: null,
            status: "error",
            beginAt: -1, 
            endAt: -1
          });
        })
    });
  }

  static getLatestProgram(communityId) {
    return new Promise(resolve => {
      axios
        .get(`https://live2.nicovideo.jp/unama/tool/v1/broadcasters/social_group/${communityId}/program`)
        .then(response => {
          if (response.data.meta.status === 200) {
            resolve({ programId: response.data.data.nicoliveProgramId });
          }
          resolve({ programId: null });
        })
    });
  }

  static search(query, sortMode) {
    return new Promise(resolve => {
      const sortModes = {
        "startTime-dsc": "recentDesc",
        "startTime-asc": "recentAsc",
        "viewCounter-dsc": "viewCountDesc",
        "viewCounter-asc": "viewCountAsc",
        "commentCounter-dsc": "commentCountDesc",
        "commentCounter-asc": "commentCountAsc"
      };
      const q = `https://sp.live.nicovideo.jp/api/search?q=${query}&sortOrder=${sortModes[sortMode]}&isTagSearch=false&disableGrouping=false&hideMemberOnly=false&timeshiftIsAvailable=false&status=onair&offset=0&limit=100`;
      axios.get(q).then(response => {
        resolve(response.data);
      });
    });
  }

  static getFollowingCommunities(cursor) {
    if (cursor === `cursorEnd`) {
      return Promise.resolve({
        cursor: cursor,
        items: []
      });
    }

    const parser = httpResponse => {
      const cursor = httpResponse.data.summary.cursor;
      const items = httpResponse.data.items.map(item => ({
          title: item.nickname,
          thumbnail: item.icons.large,
          id: item.id,
          url: `https://nicovideo.jp/user/${item.id}`
        }));
      return { 
        cursor: cursor,
        items: items
      }
    };
    return new Promise(resolve => {
      const endpoint = `https://nvapi.nicovideo.jp/v1/users/me/following/users?pageSize=100`;
      let query = ``;
      if (cursor != null) {
        query = `&cursor=${cursor}`
      }
      axios.get(endpoint + query, { headers: { "x-frontend-id": 3 } } ).then(response => {
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

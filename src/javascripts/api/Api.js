import $ from "jquery";
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
      const endpoint =
        "http://sp.live.nicovideo.jp/api/favorite?firstStreamNum=1&streamMany=100&streamType=all";
      $.get(endpoint)
        .done(response => {
          let favoriteStreams = response.favoriteStreams;
          favoriteStreams = favoriteStreams.map(stream => {
            stream.is_reserved = stream.start_time * 1000 > Date.now();
            return stream;
          });
          const videoInfoList = favoriteStreams.map(stream =>
            VIParser.parse(stream)
          );
          resolve(videoInfoList);
          // const $html = $(response);
          // const subscribes = $html.find(
          //   "[data-] > .liveItems > [class^='liveItem']"
          // );
          // const reserved = $html.find(
          //   "[id$=subscribeReservedItemsWrap] > .liveItems > [class^='liveItem']"
          // );
          // $.each($(reserved), (index, item) => {
          //   item.is_reserved = true;
          // });
          // $.merge(subscribes, reserved);
          // const videoInfoList = [];
          // $.each($(subscribes), (index, element) => {
          //   if ($($(element).find("img")[0]) === `CLOSED`) {
          //     return;
          //   }
          //   const $videoInfo = VIParser.parse(element);
          //   videoInfoList.push($videoInfo);
          // });
          resolve(videoInfoList);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          reject(errorThrown);
        });
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
      Api.getStatus(requestId).then(response => {
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

  /*
   * 放送中のチャンネルのリストを取得
   *  0: { id: "co000000",
   *       url: "http://live.nicovideo.jp/watch/lv310946190",
   *       thumbnail: "http://icon.nimg.jp/community/s/281/co2811763.jpg?1504943573",
   *       title "闘会議モルゲッソヨ" }
   */
  static fetchOnairChannelList() {
    const base =
      "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";

    const request = axios.get(base);

    return request
      .then(response => {
        if (response.status !== 200) throw new Error("failed.");
        else return Api._channelPageToChannelList(response.data);
      })
      .catch(error => {
        console.error(error);
        throw error;
      });
  }

  // 放送中のチャンネルページからチャンネルを抽出
  static _channelPageToChannelList(html) {
    const officialCastElements = $(html)
      .find(".ranking_video")
      .toArray();
    const channelList = officialCastElements.map(element => {
      const $e = $(element);
      const id = $e.find(".video_id").text();
      const prefixedId = `lv${id}`;
      const providerUrl = $e.find(".video_text a").attr("href");
      const providerRegExp = /http\:\/\/ch.nicovideo.jp\/channel\/(.+)/;
      const params = {
        id: prefixedId,
        provider: providerRegExp.exec(providerUrl)[1],
        url: `http://live.nicovideo.jp/watch/${prefixedId}`,
        thumbnail: $e.find(".info a img").attr("src"),
        title: $e.find(".video_title").text()
      };
      return params;
    });
    return channelList;
  }

  // チャンネル id から放送中でない id を抽出
  static selectOnairChannel(channels) {
    Api.fetchOnairChannelList().then(channelList => {
      const selectedChannels = channelList.filter(channel => {
        const result = channels.includes(channel.provider);
        return result;
      });
      return selectedChannels;
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
        "&targets=tags,title,description" +
        "&fields=contentId,title,communityIcon,description,start_time,live_end_time,comment_counter,score_timeshift_reserved,provider_type,tags,member_only,viewCounter,timeshift_enabled" +
        "&_context=nicosapo" +
        "&filters%5BliveStatus%5D%5B0%5D=onair" +
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

  // // 公式チャンネル・ユーザーチャンネルのフィードを Array に変換
  // static _toChannelList(channelFeed) {
  //   return parseString(channelFeed, (err, result) => {
  //     console.log(result.rss.channel[0].item);
  //     return result.rss.channel[0].item;
  //   });
  // }
}

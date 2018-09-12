import _ from "lodash";
import store from "store";
import Api from "../api/Api";
import Common from "../common/Common";
import Db from "../modules/db";
import Badge from "../modules/Badge";
import Alert from "../modules/Alert";
import VideoInfoUtil from "../modules/VideoInfoUtil";
import FollowingCommunities from "../modules/FollowingCommunities";
import CastingCommunities from "../modules/CastingCommunities";

const _followingCommunities = new FollowingCommunities();
const _castingCommunities = new CastingCommunities();

export default class BackgroundReloader {
  static run() {
    Promise.resolve()
      .then(() => Api.isLogined())
      .catch(() => {
        Badge.setText("error");
      })
      .then(Common.sleep(2000))
      .then(() => Api.loadCasts("user"))
      .then($videoInfoList => {
        // const list = $videoInfoList;
        const list = VideoInfoUtil.removeReservation($videoInfoList);
        BackgroundReloader._resetBadge(list);
        _castingCommunities.push(list);
        return new Promise(resolve => {
          resolve();
        });
      })
      .then(() => Api.getCheckList())
      .then(idList => {
        _followingCommunities.push(idList);
        return new Promise(resolve => {
          resolve();
        });
      })
      .then(BackgroundReloader._alertEach);
  }

  static _resetBadge($videoInfoList) {
    Badge.setText($videoInfoList.length);
  }

  static _resetList($videoInfos) {
    _followingCommunities.push($videoInfos);
    _castingCommunities.push($videoInfos);
  }

  static _alertEach() {
    // TODO: require argument.
    const justStartedCommunities = _castingCommunities.query("ONLY_JUST_STARTED"); // Array of jQuery Objects.
    const justFollowedCommunities = _followingCommunities.query("ONLY_JUST_FOLLOWED"); // Array of Integer.
    _.each(justStartedCommunities, community => {
      console.info("justStarted");
      const commuId = community.querySelector("community id").textContent;
      const videoId = community.querySelector("video id").textContent;
      // const number = Number(commuId);
      const thumbnail = community.querySelector("community thumbnail").textContent;
      const re = /.+((ch|co)([0-9]+))\.jpg.*/;
      const dePrefixedId = Number(re.exec(thumbnail)[3]);
      console.info(dePrefixedId);
      const distributors = store.get(`excludedDistributors`);
      if (distributors && distributors.hasOwnProperty(commuId)) {
        return; // `continue` for lodash.
      }
      if (justFollowedCommunities.includes(dePrefixedId)) {
        return; // `continue` for lodash.
      }
      if (Db.contains("autoEnterCommunityList", commuId)) {
        return; // `continue` for lodash.
      }
      if (Db.contains("autoEnterProgramList", videoId)) {
        return; // `continue` for lodash.
      }
      console.log("before alert");
      Alert.fire(community);
    });
  }
}

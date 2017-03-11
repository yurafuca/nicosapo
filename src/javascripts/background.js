import $ from 'jquery'
import _ from 'lodash'
import Api from "./api/Api"
import Db from './modules/db'
import Badge from './modules/Badge'
import Alert from './modules/Alert'
import VideoInfoUtil from './modules/VideoInfoUtil'
import FollowingCommunities from './modules/FollowingCommunities'
import CastingCommunities from './modules/CastingCommunities'
import Common from './common/Common'
import AutoEnterRunner from './autoEnter/AutoEnterRunner'
import './chrome/runtime.onMessage'

const _followingCommunities = new FollowingCommunities();
const _castingCommunities = new CastingCommunities();

$(document).ready(() => {
  Badge.setBackgroundColor('#ff6200');
  Db.setAll('autoEnterCommunityList', 'state', 'init');
  Reloader.run();
  setInterval(Reloader.run, 10 * 1000);
  Common.sleep(5 * 1000).then(() => {
    setInterval(() => {
      Promise.resolve()
        .then((new AutoEnterRunner()).run('live'))
        .then((new AutoEnterRunner()).run('community'));
    }, 60 * 1000);
  });
});


export class Reloader {
  static run() {
    Promise.resolve()
    .then(() => Api.isLogined())
    .then(Common.sleep(2000))
    .catch(() => {
      Badge.set('x')
    })
    .then(() => Api.loadCasts('user'))
    .then(($videoInfoList) => {
      // const list = $videoInfoList;
      const list = VideoInfoUtil.removeReservation($videoInfoList);
      Reloader._resetBadge(list);
      _castingCommunities.push(list);
      return new Promise((resolve) => {
        resolve();
      });
    })
    .then(() => Api.getCheckList())
    .then((idList) => {
      _followingCommunities.push(idList);
      return new Promise((resolve) => {
        resolve();
      });
    })
    .then(Reloader._alertEach);
  }

  static _resetBadge($videoInfoList) {
    const zero2empty = (num) => num === 0 ? '' : num;
    const text = zero2empty($videoInfoList.length);
    Badge.setText(text);
  }

  static _resetList($videoInfos) {
    _followingCommunities.push($videoInfos);
    _castingCommunities.push($videoInfos);
  }

  static _alertEach() { // TODO: require argument.
    const justStartedCommunities  = _castingCommunities.query('ONLY_JUST_STARTED');    // Array of jQuery Objects.
    const justFollowedCommunities = _followingCommunities.query('ONLY_JUST_FOLLOWED'); // Array of Integer.
    _.each(justStartedCommunities, (community) => {
      const commuId = community.find('community id').text();
      const videoId = community.find('video id').text();
      const number = Number(commuId);
      if (justFollowedCommunities.includes(number)) {
        return; // `continue` for lodash.
      }
      if (Db.contains('autoEnterCommunityList', commuId)) {
        return; // `continue` for lodash.
      }
      if (Db.contains('autoEnterProgramList', videoId)) {
        return; // `continue` for lodash.
      }
      Alert.fire(community);
    });
  }
}

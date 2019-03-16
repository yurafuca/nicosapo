import Api from "../api/Api";
import Common from "../common/Common";
import Badge from "../modules/Badge";
import bucket from "./Bucket";
import { CommunityBuilder, ProgramBuilder } from './CheckableBuilder';
import {Letter} from "./NoticeLetter";
import VideoInfoUtil from './VideoInfoUtil';

// const _followingCommunities = new FollowingCommunities();
// const _castingCommunities = new CastingCommunities();

const client = bucket.createClient();

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
          $videoInfoList = VideoInfoUtil.removeReservation($videoInfoList);
          Badge.setText($videoInfoList.length);
          const builders = [];
          $videoInfoList.forEach(videoInfo => {
              const commuId = videoInfo.querySelector("community id").textContent;
              const videoId = videoInfo.querySelector("video id").textContent;
              const title = videoInfo.querySelector("video title").textContent;
              const thumbnail = videoInfo.querySelector("community thumbnail").textContent;

              const community = new CommunityBuilder()
                  .id(commuId)
                  .thumbnailUrl(thumbnail)
                  .isFollowing(true);

              const program = new ProgramBuilder()
                .id(videoId)
                .title(title);

              bucket.assign(community, program);

              const temp = {
                co: community,
                pr: program
              };

              builders.push(temp);
          });

          // 0 0 0 0
          // mask 1
          // 0 0 0 0
          // mask 2
          // 0 0 0 0 2
          // mask 3
        const foo = builders.map(v => v.co);
        bucket.mask(foo);
        // const list = bucket.takeProgramsShouldNotify(client);
        //
        // list.forEach(clickable => {
        //   const letter = new Letter().setup(clickable);
        //   letter.launch();
        // })
      });
  }

  // static _resetBadge($videoInfoList) {
  //   Badge.setText($videoInfoList.length);
  // }

  // static _resetList($videoInfos) {
  //   _followingCommunities.push($videoInfos);
  //   _castingCommunities.push($videoInfos);
  // }
  //
  // static _alertEach() {
  //   // TODO: require argument.
  //   const justStartedCommunities = _castingCommunities.query("ONLY_JUST_STARTED"); // Array of jQuery Objects.
  //   const justFollowedCommunities = _followingCommunities.query("ONLY_JUST_FOLLOWED"); // Array of Integer.
  //   _.each(justStartedCommunities, community => {
  //     console.info("justStarted");
  //     const commuId = community.querySelector("community id").textContent;
  //     const videoId = community.querySelector("video id").textContent;
  //     // const number = Number(commuId);
  //     const thumbnail = community.querySelector("community thumbnail").textContent;
  //     const re = /.+((ch|co)([0-9]+))\.jpg.*/;
  //     const dePrefixedId = Number(re.exec(thumbnail)[3]);
  //     console.info(dePrefixedId);
  //     const distributors = store.get(`excludedDistributors`);
  //     if (distributors && distributors.hasOwnProperty(commuId)) {
  //       return; // `continue` for lodash.
  //     }
  //     if (justFollowedCommunities.includes(dePrefixedId)) {
  //       return; // `continue` for lodash.
  //     }
  //     if (Db.contains("autoEnterCommunityList", commuId)) {
  //       return; // `continue` for lodash.
  //     }
  //     if (Db.contains("autoEnterProgramList", videoId)) {
  //       return; // `continue` for lodash.
  //     }
  //     console.log("before alert");
  //     Alert.fire(community);
  //   });
  // }
}

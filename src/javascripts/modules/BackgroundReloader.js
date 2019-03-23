import Api from "../api/Api";
import Common from "../common/Common";
import Badge from "../modules/Badge";
import bucket from "./Bucket";
import { CommunityBuilder, ProgramBuilder } from './ManageableBuilder';
import {Poster} from "./Poster";
import VideoInfoUtil from './VideoInfoUtil';

export default class BackgroundReloader {
  static run() {
    Promise.resolve()
      .then(() => Api.loadCasts("user"))
      .then($videoInfoList => {
        $videoInfoList = VideoInfoUtil.removeReservation($videoInfoList);
        Badge.setText($videoInfoList.length);
        const builders = [];
        $videoInfoList.forEach(videoInfo => {
          const communityId = videoInfo.querySelector("community id").textContent;
          const videoId = videoInfo.querySelector("video id").textContent;
          const title = videoInfo.querySelector("video title").textContent;
          const thumbnail = videoInfo.querySelector("community thumbnail").textContent;

          const community = new CommunityBuilder()
            .id(communityId)
            .title("")
            .thumbnailUrl(thumbnail)
            .isFollowing(true);

          const program = new ProgramBuilder()
            .id(videoId)
            .title(title);

          bucket.touchBoth(community, program);

          const temp = {
            co: community,
            pr: program
          };

          builders.push(temp);
        });

        bucket.mask(builders.map(v => v.co));
      });
  }
}
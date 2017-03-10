export default class CastingCommunities {
  constructor() {
    this.previous = null;
    this.current = null;
  }

  query(q) {
    let result = null;
    switch(q) {
      case `ALL`:
        result = this._all();
        break;
      case `ONLY_JUST_STARTED`:
        result = this._onlyJustStarted();
        break;
      default:
        throw new Error(`${q} is illegal query.`);
    }
    return result;
  }

  /**
   * previous では放送をしていなかったが current では放送を
   * 開始したコミュニティのリストを返却
   */
  _onlyJustStarted() {
    if (this.previous === null) {
      throw new Error(`previous is null.`);
    }
    if (this.current === null) {
      throw new Error(`current is null.`);
    }
    const openTimesOfPrevious = Object.keys(this.previous).map((id) => {
      return this.previous[id].find('video open_time_jpstr').text(); // => [ 'time1', 'time2', 'time0']
    });
    const openTimesOfCurrent = Object.keys(this.current).map((id) => {
      return this.current[id].find('video open_time_jpstr').text(); // => [ 'time1', 'time2', 'time3', 'time4', 'time0' ]
    });
    const timesOfDiff = openTimesOfCurrent.filter((time) => {
      return !openTimesOfPrevious.includes(time); // => [ 'time3', 'time4' ]
    });
    const communityIdsOfDiff = Object.keys(this.current).filter((id, index) => {
      const time =  this.current[id].find('video open_time_jpstr').text();
      return timesOfDiff.includes(time); // => [ '333333', '444444' ]
    });
    const communities = {};
    communityIdsOfDiff.forEach((id) => {
      communities[id] = this.current[id];
    });
    return communities;
  }

  _all() {
    if (this.current === null) {
      throw new Error(`current is null.`);
    }
    return this.current;
  }

  push($videoInfos) {
    this.previous = this.current;
    this.current = $videoInfos;
  }
}

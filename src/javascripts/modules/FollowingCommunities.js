import _ from 'lodash'

export default class FollowingCommunities {
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
      case `ONLY_JUST_FOLLOWED`:
        result = this._onlyJustFollowed();
        break;
      default:
        throw new Error(`${q} is illegal query.`);
    }
    return result;
  }


  _onlyJustFollowed() {
    if (this.current === null) {
      throw new Error(`current is null.`);
    }
    const communities = this.current.filter((communityId) => {
      const empty = [];
      return !_.includes((this.previous || empty), communityId);
    });
    return communities;
  }

  // 新しく放送を開始した
  _all() {
    if (this.current === null) {
      throw new Error(`current is null.`);
    }
    return this.current;
  }

  push(arrayOfId) {
    this.previous = this.current;
    this.current = arrayOfId;
  }
}

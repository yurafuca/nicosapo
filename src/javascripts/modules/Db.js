import store from "store";

export default class Db {
  static contains(target, value) {
    const acceptableTargets = [
      "autoEnterCommunityList",
      "autoEnterProgramList"
    ];
    if (acceptableTargets.includes(target) === false) {
      throw new Error(`${target} is illegal target`);
    }
    return Db._contains(target, value);
  }

  static setAll(target, prop, value) {
    if (target == null || prop == null || value == null) {
      throw new Error(`Requires 'target', 'prop' and 'value'`);
    }
    const list = store.get(target);
    for (const id in list) {
      list[id][prop] = value;
    }
    store.set(target, list);
  }

  static _contains(target, value) {
    const list = store.get(target);
    for (const id in list) {
      if (id === value) {
        return true;
      }
    }
    return false;
  }
}

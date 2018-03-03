import store from "store";
import _ from "lodash";

const KEY = `NiconamaTabs`;

export default class NiconamaTabs {
  static get(tabId) {
    const list = NiconamaTabs.list();
    return list[tabId];
  }

  static list() {
    return store.get(KEY);
  }

  static getTabId(castId) {
    const list = store.get(KEY) || {};
    let result = null;
    Object.keys(list).forEach(tabId => {
      if (list[tabId].castId === castId) {
        result = tabId;
      }
    });
    return result;
  }

  static add(tabId, castId, scrollTop) {
    if (castId == null) {
      return;
    }
    console.log(`[nicosapo] Add ${tabId} to opening tab`);
    const list = store.get(KEY) || {};
    const item = { castId: castId, scrollTop: scrollTop };
    list[tabId] = item;
    store.set(KEY, list);
  }

  static remove(tabId) {
    console.log(`[nicosapo] Remove ${tabId} from opening tab`);
    const list = store.get(KEY) || {};
    delete list[tabId];
    // tabIds = tabIds.filter((id) => id != tabId);
    store.set(KEY, list);
  }

  static clear() {
    store.set(KEY, {});
  }

  static isCastPage(url) {
    const re = /http:\/\/live2?\.nicovideo\.jp\/watch\/lv([0-9]+)/;
    if (re.exec(url)) {
      const liveId = `lv${re.exec(url)[1]}`;
      return liveId;
    } else {
      return null;
    }
  }
}

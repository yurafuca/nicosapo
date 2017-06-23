import store from 'store'
import _ from 'lodash';

const KEY = `NiconamaTabs`;

export default class NiconamaTabs {
  static openingList() {
    return store.get(KEY);
  }

  static getTabId(castId) {
    const tabIds = store.get(KEY) || {};
    let result = null;
    Object.keys(tabIds).forEach((_tabId) => {
      if (tabIds[_tabId] === castId) {
        result = _tabId;
      }
    });
    return result;
  }

  static add(tabId, castId) {
    if (castId == null) {
      return;
    }
    console.log(`[nicosapo] Add ${tabId} to opening tab`);
    const tabIds = store.get(KEY) || {};
    tabIds[tabId] = castId;
    store.set(KEY, tabIds);
  }

  static remove(tabId) {
    console.log(`[nicosapo] Remove ${tabId} from opening tab`);
    const tabIds = store.get(KEY) || {};
    delete tabIds[tabId];
    // tabIds = tabIds.filter((id) => id != tabId);
    store.set(KEY, tabIds);
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

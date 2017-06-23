import store from 'store'

const KEY = `NiconamaTabs`;

chrome.tabs.onCreated.addListener((tab) => {
  NiconamaTabs._add(tab.id);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  NiconamaTabs._remove(tabId);
});


export default class NiconamaTabs {
  static openingList() {
    return store.get(KEY);
  }

  static isOpening(tabId) {
    const tabIds = store.get(KEY);
    return tabIds.includes(tabId);
  }

  static _add(tabId) {
    console.log(`[nicosapo] Add ${tabId} to opening tab`);
    const tabIds = store.get(KEY);
    tabIds.push(tabId);
    store.set(KEY, tabIds);
  }

  static _remove(tabId) {
    console.log(`[nicosapo] Remove ${tabId} from opening tab`);
    let tabIds = store.get(KEY);
    tabIds = tabIds.filter((id) => { return id != tabId; });
    store.set(KEY, tabIds);
  }
}

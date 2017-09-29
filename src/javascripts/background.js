import store from 'store'
import Db from './modules/db'
import Badge from './modules/Badge'
import NiconamaTabs from './modules/NiconamaTabs'
import BackgroundReloader from './modules/BackgroundReloader'
import Common from './common/Common'
import AutoEnterRunner from './autoEnter/AutoEnterRunner'
import './chrome/runtime.onMessage'

chrome.runtime.onInstalled.addListener(() => {
  NiconamaTabs.clear();
});

chrome.runtime.onStartup.addListener(() => {
  NiconamaTabs.clear();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  NiconamaTabs.remove(tabId);
});

chrome.idle.onStateChanged.addListener((newState) => {
  switch(newState) {
    case 'active':
      store.set('state.autoEnter.cancel', false);
      break;
    case 'locked':
      if (store.get('options.autoEnter.cancel.onLocked') === true)
        store.set('state.autoEnter.cancel', true);
      break;
    case 'idle':
      // Ignore.
      break;
  }
});

Badge.setBackgroundColor('#ff6200');
Db.setAll('autoEnterCommunityList', 'state', 'init');
BackgroundReloader.run();
setInterval(BackgroundReloader.run, 60 * 1000);
Common.sleep(7 * 1000).then(() => {
  setInterval(() => {
    Promise.resolve()
      .then((new AutoEnterRunner()).run('live'))
      .then((new AutoEnterRunner()).run('community'));
  }, 60 * 1000);
});

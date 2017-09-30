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

const idleMinute = store.get('options.idle.minute');
chrome.idle.setDetectionInterval(idleMinute * 60);
// chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener((newState) => {
  const cancelList = store.get('options.autoEnter.cancelList');
  switch(newState) {
    case 'active': {
      store.set('state.autoEnter.cancel', false);
      break;
    }
    case 'locked': {
      const isCanceled = cancelList.includes('onLocked');
      if (isCanceled)
        store.set('state.autoEnter.cancel', true);
      break;
    }
    case 'idle': {
      const isCanceled = cancelList.includes('onIdled');
      if (isCanceled)
        store.set('state.autoEnter.cancel', true);
      break;
    }
  }
});

Badge.setBackgroundColor('#ff6200');
Db.setAll('autoEnterCommunityList', 'state', 'init');
BackgroundReloader.run();
setInterval(BackgroundReloader.run, 60 * 1000);
Common.sleep(7 * 1000).then(() => {
  setInterval(() => {
    if (!store.get('state.autoEnter.cancel')) {
      Promise.resolve()
        .then((new AutoEnterRunner()).run('live'))
        .then((new AutoEnterRunner()).run('community'));
    } else {
      console.log('Canceled auto enter.');
    }
  }, 60 * 1000);
});

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

const idleMinute = store.get('options.idle.minute') || 10;
chrome.idle.setDetectionInterval(Number(idleMinute) * 60);
// chrome.idle.setDetectionInterval(15);

chrome.idle.onStateChanged.addListener((newState) => {
  const cancelList = store.get('options.autoEnter.cancelList');
  switch(newState) {
    case 'active': {
            console.log('active >>>>>>>>>>>>>>>>>');
      store.set('state.autoEnter.cancel', false);
      break;
    }
    case 'locked': {
            console.log('locked ==============');
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
    const isForceCancel = store.get('options.autoEnter.forceCancel') || false;
    const isAutoCancel  = store.get('state.autoEnter.cancel') || false;
    console.log(isForceCancel);
    console.log(isAutoCancel);
    if (!isForceCancel && !isAutoCancel) {
      console.log('enter');
      Promise.resolve()
        .then((new AutoEnterRunner()).run('live'))
        .then((new AutoEnterRunner()).run('community'));
    } else {
      console.log('Canceled auto enter.');
    }
  }, 2 * 1000);
});

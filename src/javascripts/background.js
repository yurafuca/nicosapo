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

chrome.idle.onStateChanged.addListener((newState) => {
  switch(newState) {
    case 'active': {
      store.set('state.autoEnter.cancel', false);
      break;
    }
    case 'locked': {
      // Ignore.
      // Reason: Chrome 61 cannot detect "locked" correctly.
      break;
    }
    case 'idle': {
      const isCanceled = store.get('options.autoEnter.cancel.onIdle');
      if (isCanceled)
        store.set('state.autoEnter.cancel', true);
      break;
    }
  }
});

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    type: 'checkbox',
    title: '自動入場を一時的に無効にする',
    contexts: ['browser_action'],
    checked: store.get('options.autoEnter.forceCancel'),
    onclick: function () {
      const currentValue = store.get('options.autoEnter.forceCancel');
      store.set('options.autoEnter.forceCancel', !currentValue);
    }
  });
})

Badge.setBackgroundColor('#ff6200');
Db.setAll('autoEnterCommunityList', 'state', 'init');
BackgroundReloader.run();
setInterval(BackgroundReloader.run, 60 * 1000);
Common.sleep(7 * 1000).then(() => {
  setInterval(() => {
    const isForceCancel = store.get('options.autoEnter.forceCancel') || false;
    const isAutoCancel  = store.get('state.autoEnter.cancel') || false;
    if (!isForceCancel && !isAutoCancel) {
      Promise.resolve()
        .then((new AutoEnterRunner()).run('live'))
        .then((new AutoEnterRunner()).run('community'));
    } else {
      console.log('Canceled auto enter.');
    }
  }, 60 * 1000);
});

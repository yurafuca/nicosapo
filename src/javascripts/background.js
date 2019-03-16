import { Subject, pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import store from "store";
import deamon from "./modules/Deamon";
import Db from "./modules/db";
import Badge from "./modules/Badge";
import NiconamaTabs from "./modules/NiconamaTabs";
import BackgroundReloader from "./modules/BackgroundReloader";
import Common from "./common/Common";
import AutoEnterRunner from "./autoEnter/AutoEnterRunner";
import "./chrome/runtime.onMessage";

// import {CheckableBuilder} from "./modules/CheckableBuilder";
// import { Community } from "./modules/Bucket";

chrome.runtime.onInstalled.addListener(() => {
  NiconamaTabs.clear();
});

chrome.runtime.onStartup.addListener(() => {
  NiconamaTabs.clear();
});

chrome.tabs.onRemoved.addListener((tabId, info) => {
  // const url = info.i
  NiconamaTabs.remove(tabId);
});

const idleMinute = store.get("options.idle.minute") || 10;
chrome.idle.setDetectionInterval(Number(idleMinute) * 60);

chrome.idle.onStateChanged.addListener(newState => {
  switch (newState) {
    case "active": {
      store.set("state.autoEnter.cancel", false);
      break;
    }
    case "locked": {
      // Ignore.
      // Reason: Chrome 61 cannot detect "locked" correctly.
      break;
    }
    case "idle": {
      const isCanceled = store.get("options.autoEnter.cancel.onIdle");
      if (isCanceled) store.set("state.autoEnter.cancel", true);
      break;
    }
  }
});

chrome.contextMenus.removeAll(() => {
  chrome.contextMenus.create({
    type: "checkbox",
    title: "自動入場を手動で無効にする",
    contexts: ["browser_action"],
    checked: store.get("options.autoEnter.forceCancel"),
    onclick: function() {
      const currentValue = store.get("options.autoEnter.forceCancel");
      store.set("options.autoEnter.forceCancel", !currentValue);
    }
  });
});





// range(1, 200).pipe(
//     filter(x => x % 2 === 1),
//     map(x => x + x)
// ).subscribe(x => console.log(x));
//
// const list = bucket.all()
//     .filter(p => p.isFollowing)
//     .filter(p => p.isJustStarted)
//     .filter(p => !p.shouldOpenAutomatically);

Badge.setBackgroundColor("#ff6200");
Db.setAll("autoEnterCommunityList", "state", "init");
BackgroundReloader.run();

setInterval(BackgroundReloader.run, 10 * 1000);
Common.sleep(7 * 1000).then(() => {
  setInterval(() => {
    const isForceCancel = store.get("options.autoEnter.forceCancel") || false;
    const isAutoCancel = store.get("state.autoEnter.cancel") || false;
    if (!isForceCancel && !isAutoCancel) {
      Promise.resolve()
        .then(new AutoEnterRunner().run("live"))
        .then(new AutoEnterRunner().run("community"));
    } else {
      console.log("Canceled auto enter.");
    }
  }, 60 * 1000);
});

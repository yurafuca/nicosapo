import store from "store";
import { interval } from 'rxjs';
import "./modules/Pipe";
import "./modules/Deamon";
import Db from "./modules/db";
import Badge from "./modules/Badge";
import NiconamaTabs from "./modules/NiconamaTabs";
import BackgroundReloader from "./modules/BackgroundReloader";
import "./chrome/runtime.onMessage";
import { CommunityBuilder, ProgramBuilder } from "./modules/ManageableBuilder";
import bucket from "./modules/Bucket";

// v4.6.2 -> v4.7.0
const isMigrated = store.get("search.query.isMigrated", false);
if (!isMigrated) {
  const favorites = store.get("search.query.favorite", []);
  const list = [];
  for (const favorite of favorites) {
    const item = {
      query: favorite,
      query_label: favorite
    };
    list.push(item);
  }
  store.set("search.query.favorites", list);
  store.set("search.query.isMigrated", true);
}

chrome.runtime.onInstalled.addListener(() => {
  NiconamaTabs.clear();
});

chrome.runtime.onStartup.addListener(() => {
  NiconamaTabs.clear();
});

chrome.tabs.onRemoved.addListener((tabId, info) => {
  NiconamaTabs.remove(tabId);
});

Object.entries(store.get("autoEnterProgramList", {})).forEach(([id, program]) => {
  const builder = new ProgramBuilder()
    .id(id)
    .title(program.title)
    .shouldOpenAutomatically(true);
  bucket.appointProgram(builder, program.thumbnail);
});

Object.entries(store.get("autoEnterCommunityList", {})).forEach(([id, community]) => {
  const builder = new CommunityBuilder()
    .id(id)
    .thumbnailUrl(community.thumbnail)
    .title(community.title)
    .shouldOpenAutomatically(true);
  bucket.touchCommunity(builder);
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

Badge.setBackgroundColor("#ff6200");
Db.setAll("autoEnterCommunityList", "state", "init");

interval(1000 * 60).subscribe(
  _ => { BackgroundReloader.run() }
);

// Make Observable Interval start immediately without a delay.
BackgroundReloader.run();

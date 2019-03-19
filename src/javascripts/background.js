import { Subject, pipe } from "rxjs";
import { map, filter } from "rxjs/operators";
import store from "store";
import "./modules/Pipe";
import "./modules/Deamon";
import Db from "./modules/db";
import Badge from "./modules/Badge";
import NiconamaTabs from "./modules/NiconamaTabs";
import BackgroundReloader from "./modules/BackgroundReloader";
import Common from "./common/Common";
import AutoEnterRunner from "./autoEnter/AutoEnterRunner";
import "./chrome/runtime.onMessage";
import $ from "jquery";
import { CommunityBuilder, ProgramBuilder } from "./modules/ManageableBuilder";
import bucket from "./modules/Bucket";

chrome.runtime.onInstalled.addListener(() => {
  NiconamaTabs.clear();
});

chrome.runtime.onStartup.addListener(() => {
  NiconamaTabs.clear();
});

chrome.tabs.onRemoved.addListener((tabId, info) => {
  NiconamaTabs.remove(tabId);
});

Object.entries(store.get("autoEnterProgramList")).forEach(([id, program]) => {
  const builder = new ProgramBuilder()
    .id(id)
    .title(program.title)
    .shouldOpenAutomatically(true);
  bucket.appointOrphan(builder, program.thumbnail);
});

Object.entries(store.get("autoEnterCommunityList")).forEach(([id, community]) => {
  const builder = new CommunityBuilder()
    .id(id)
    .thumbnailUrl(community.thumbnail)
    .title(community.title)
    .shouldOpenAutomatically(true);
  bucket.touch(builder);
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
BackgroundReloader.run();

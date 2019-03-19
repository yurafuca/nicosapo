import {Subject, interval} from 'rxjs';
import store from "store";
import bucket from "./Bucket";
import { Bell, Poster } from "./Poster";
import { Program } from "./Manageable";

const AUTOMATIC_VISITING_KEY = "autoEnterProgramList";
let isInitialCheck = true;

const removeFromAutomaticVisitingList = (id: string) => {
  const programsShouldOpen = store.get(AUTOMATIC_VISITING_KEY, {});
  delete programsShouldOpen[id];
  store.set(AUTOMATIC_VISITING_KEY, programsShouldOpen);
};

const notify = (program: Program) => {
  const poster = new Poster(program.title, program.community.thumbnailUrl, program.id);
  const shouldRing = store.get("options.playsound.enable") || "enable";
  if (shouldRing == "enable") {
    const name = store.get("options.soundfile") || "ta-da.mp3";
    const volume = store.get("options.playsound.volume") || 1.0;
    const bell = new Bell(name).volume(volume);
    poster.bell(bell);
  }
  const duration = store.get("options.openingNotification.duration") || 6;
  poster.duration(duration);
  poster.launch();
};

(() => {
  const client = bucket.createClient();
  interval(1000).subscribe(
    _ => {
      bucket.takeProgramsShouldNotify(client).forEach((p, index, array) => {
        const distributors = store.get(`excludedDistributors`) || {};
        const shouldPopup = store.get("options.popup.enable") || "enable";
        if (!isInitialCheck &&
          !distributors.hasOwnProperty(p.community.id) &&
          shouldPopup == "enable"
        ) {
          notify(p);
        }
        if (index == array.length - 1) {
          isInitialCheck = false;
        }
      })
    }
  );
})();

(() => {
  const client = bucket.createClient();
  interval(1000).subscribe(
    _ => {
      bucket.takeProgramsShouldOpen(client).forEach(p => {
        // Show notification.
        chrome.notifications.create("",{
          type: "basic",
          title: "番組へ自動入場します",
          message: p.title,
          iconUrl: p.community.thumbnailUrl
        });
        // Create tab.
        const url = `https://live.nicovideo.jp/watch/${p.id}`;
        chrome.tabs.create({ url: url });
        // Delete.
        removeFromAutomaticVisitingList(p.id);
        // Update
        p.onAutomaticVisit();
      });
    }
  );
})();

(() => {
  const client = bucket.createClient();
  interval(1000).subscribe(
    _ => {
      bucket.takeProgramsShouldCancelOpen(client).forEach(p => {
        // Show notification.
        chrome.notifications.create("", {
          type: "basic",
          title: "すでに開かれている番組の自動入場をキャンセルしました",
          message: p.title,
          iconUrl: p.community.thumbnailUrl
        });
        // Delete.
        removeFromAutomaticVisitingList(p.id);
      });
    }
  );
})();

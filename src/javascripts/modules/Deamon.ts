import {Subject, interval} from 'rxjs';
import store from "store";
import bucket from "./Bucket";
import { Letter } from "./NoticeLetter";

const AUTOMATIC_VISITING_KEY = "autoEnterProgramList";

(() => {
  const client = bucket.createClient();
  interval(1000).subscribe(
    _ => {
      bucket.takeProgramsShouldNotify(client).forEach(p => {
        const letter = new Letter().setup(p);
        letter.launch();
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
        chrome.notifications.create(p.id, {
          type: "basic",
          title: "番組へ自動入場します",
          message: p.title,
          iconUrl: p.community.thumbnailUrl
        });
        // Delete.
        const programsShouldOpen = store.get(AUTOMATIC_VISITING_KEY, {});
        delete programsShouldOpen[p.id];
        store.set(AUTOMATIC_VISITING_KEY, programsShouldOpen);
        // Create tab.
        const url = `https://live.nicovideo.jp/watch/${p.id}`;
        chrome.tabs.create({ url: url });
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
        chrome.notifications.create(p.id, {
          type: "basic",
          title: "すでに開かれている番組の自動入場をキャンセルしました．",
          message: p.title,
          iconUrl: p.community.thumbnailUrl
        });
        // Delete.
        const programsShouldOpen = store.get(AUTOMATIC_VISITING_KEY, {});
        delete programsShouldOpen[p.id];
        store.set(AUTOMATIC_VISITING_KEY, programsShouldOpen);
      });
    }
  );
})();

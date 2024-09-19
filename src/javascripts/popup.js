import store from "store";
import Api from "./api/Api";
import UserThumbnails from "./modules/UserThumbnails";
import OfficialThumbnails from "./modules/OfficialThumbnails";
import Thumbnail from "./modules/Thumbnail";
import Search from "./modules/search";
import {
  showSpinner,
  hideSpinner
} from "./modules/spinner";

// DOM を削除・非表示
class Elements {
  static remove(HTMLElements) {
    [...HTMLElements].forEach(el => el.remove());
  }

  static hide(HTMLElements) {
    [...HTMLElements].forEach(el => (el.style.display = "none"));
  }
}

class Streams {
  static show(streams, genre) {
    let params;
    switch (genre) {
      case "user":
      case "reserve":
        params = UserThumbnails.getParams(streams);
        break;
      case "official":
        params = OfficialThumbnails.getParams(streams);
        break;
      case "future":
        params = OfficialThumbnails.getParams(streams);
        break;
      default: // Discard.
    }

    const container = document.getElementById("container");

    if (params.length === 0) {
      const message = document.createElement("div");
      message.className = "message";
      message.textContent = "フォロー中のコミュニティ・チャンネルが放送している番組はありません 😴";
      container.appendChild(message);
    }

    params.forEach(param => {
      const thumbnail = new Thumbnail();
      thumbnail.setParams(param);
      const thumbnailElement = thumbnail.createElement();
      container.appendChild(thumbnailElement);

      if (genre === 'reserve' || genre === "future" || genre === 'search') {
        return;
      }

      // コメント数・来場者数読み込み
      Api.fetchVideoStatistics(thumbnail._id).then(res => {
        const {
          watchCount,
          commentCount
        } = res.data.data;
        thumbnail.setParams({
          watchCount: watchCount.toString(),
          commentCount: commentCount.toString()
        });
      }).catch(() => {
        thumbnail._isRequireRSS = true;
      });
    });
  }
}

class Tabs {
  static change(genre) {
    // 選択中のタブを選択した場合は無視する
    if (genre === Tabs._selected()) {
      return;
    }

    const searchroot = document.querySelector("#search-root");
    if (searchroot) {
      searchroot.remove();
    }

    const ctnr = document.getElementById("container");
    ctnr.style.display = "block";

    // 検索タブの場合は親要素の overflow-y を調整する
    if (genre === "search") {
      ctnr.style.overflowY = "visible";
    } else {
      ctnr.style.overflowY = "scroll";
    }

    Elements.remove(document.querySelectorAll(".community-hover"));
    Elements.remove(document.querySelectorAll(".message"));

    this._deselectAll();
    this._select(genre);

    showSpinner();

    // 検索タブ以外は API を叩いて番組をロードする
    switch (genre) {
      case "user":
      case "reserve":
      case "official":
      case "future":
        {
          Api.loadCasts(genre).then(streams => {
            hideSpinner();
            Streams.show(streams, genre);
          });
          break;
        }
      case "search":
        {
          const search = new Search();
          search.loadHTML();
        }
    }
  }

  static _selected() {
    const tab = document.querySelector(".tab.selected");
    if (tab) {
      return tab.id;
    } else {
      null;
    }
  }

  static _select(genre) {
    const tab = document.querySelector(`#${genre}`);
    tab.className = "tab selected";
  }

  static _deselectAll() {
    const allTabs = document.querySelectorAll(".tab");
    for (const tab of allTabs) {
      tab.className = "tab non-selected";
    }
  }
}

// ツールチップが表示されたら，ツールチップにマウスオーバーしたときツールチップを非表示にする
{
  const observer = new MutationObserver(() => {
    const tooltips = document.querySelectorAll(".tooltip");
    Array.prototype.forEach.call(tooltips, el => {
      el.addEventListener("mouseover", () => {
        Elements.hide(document.querySelectorAll(".tooltip"));
      });
    });
  });

  observer.observe(document.querySelector("#nicosapo"), {
    childList: true
  });
}

// 予約番組の表示が有効になっている場合は予約タブを追加する
{
  const isShowReservedStreams = store.get("options.showReserved.enable");
  if (isShowReservedStreams === "enable" || isShowReservedStreams == null) {
    const reserveTab = document.createElement("div");
    reserveTab.className = "tab non-selected";
    reserveTab.id = "reserve";
    reserveTab.textContent = "予約";

    const officialTab = document.querySelector("#official");
    const tabContainer = document.querySelector("#tab-container");
    tabContainer.insertBefore(reserveTab, officialTab);

    const tabs = document.querySelectorAll(".tab");
    Array.prototype.forEach.call(tabs, tab => {
      tab.style.width = "20%";
    });
  }
}

// 初回表示
{
  // バージョンを表示
  const version = document.querySelector(".version");
  version.textContent = chrome.runtime.getManifest().version;

  const tab = store.get("options.defaultTab", "following");
  switch (tab) {
    case "following":
      Tabs.change("user");
      break;
    case "following_future":
      Tabs.change("reserve");
      break;
    case "official":
      Tabs.change("official");
      break;
    case "official_future":
      Tabs.change("future");
      break;
    case "search":
      Tabs.change("search");
      break;
  }
}

// イベントリスナ
{
  const userTab = document.getElementById("user");
  userTab.addEventListener("click", () => {
    Tabs.change("user");
});

  const officialTab = document.getElementById("official");
  officialTab.addEventListener("click", () => {
    Tabs.change("official");
  });

  const futureTab = document.getElementById("future");
  futureTab.addEventListener("click", () => {
    Tabs.change("future");
  });

  document.getElementById("search").addEventListener("click", () => {
    Tabs.change("search");
  });

  // 予約タブの存在は設定に依存する
  const reserveTab = document.getElementById("reserve");
  if (reserveTab) {
    reserveTab.addEventListener("click", () => {
      Tabs.change("reserve");
    });
  }
}
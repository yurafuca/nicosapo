import store from "store";
import Api from "./api/Api";
import UserThumbnails from "./modules/UserThumbnails";
import OfficialThumbnails from "./modules/OfficialThumbnails";
import Thumbnail from "./modules/Thumbnail";
import Search from "./modules/search";
import { showSpinner, hideSpinner } from "./modules/spinner";

// DOM を削除・非表示
const removeElements = elms => [...elms].forEach(el => el.remove());
const hideElements = elms => [...elms].forEach(el => (el.style.display = "none"));

// 番組表示
const showStream = (streams, genre) => {
  let params;
  switch (genre) {
    case "user":
      params = UserThumbnails.getParams(streams, false);
      break;
    case "reserve":
      params = UserThumbnails.getParams(streams, true);
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

  params.forEach(param => {
    const frame = Thumbnail.createElement(param);
    container.appendChild(frame);
  });

  if (params.length === 0) {
    const message = document.createElement("div");
    message.className = "message";
    message.textContent = "フォロー中のコミュニティ・チャンネルが放送している番組はありません 😴";
    container.appendChild(message);
  }
};

// タブ切り替え
const changeTab = genre => {
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

  removeElements(document.querySelectorAll(".community-hover-wrapper"));
  removeElements(document.querySelectorAll(".message"));
  deselectTabs();
  selectTab(genre);
};

const deselectTabs = () => {
  const allTabs = document.querySelectorAll(".tab");
  for (const tab of allTabs) {
    tab.className = "tab non-selected";
  }
};

const selectTab = genre => {
  const tab = document.querySelector(`#${genre}`);
  tab.className = "tab selected";
};

// 初回表示
{
  Api.loadCasts("user").then(streams => {
    hideSpinner();
    showStream(streams, "user");
  });
}

// ツールチップが表示されたら，ツールチップにマウスオーバーしたときツールチップを非表示にする
{
  const observer = new MutationObserver(() => {
    const tooltips = document.querySelectorAll(".tooltip");
    Array.prototype.forEach.call(tooltips, el => {
      el.addEventListener("mouseover", () => {
        hideElements(document.querySelectorAll(".tooltip"));
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
  if (isShowReservedStreams === "enable") {
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

// イベントリスナ
{
  const userTab = document.getElementById("user");
  userTab.addEventListener("click", () => {
    changeTab("user");
    showSpinner();
    Api.loadCasts("user").then(streams => {
      hideSpinner();
      showStream(streams, "user");
    });
  });

  const officialTab = document.getElementById("official");
  officialTab.addEventListener("click", () => {
    changeTab("official");
    showSpinner();
    Api.loadCasts("official").then(streams => {
      hideSpinner();
      showStream(streams, "official");
    });
  });

  const futureTab = document.getElementById("future");
  futureTab.addEventListener("click", () => {
    changeTab("future");
    showSpinner();
    Api.loadCasts("future").then(streams => {
      hideSpinner();
      showStream(streams, "future");
    });
  });

  document.getElementById("search").addEventListener("click", () => {
    changeTab("search");
    showSpinner();
    const search = new Search();
    search.loadHTML();
  });

  // 予約タブの存在は設定に依存する
  const reserveTab = document.getElementById("reserve");
  if (reserveTab) {
    reserveTab.addEventListener("click", () => {
      changeTab("reserve");
      showSpinner();
      Api.loadCasts("user").then(streams => {
        hideSpinner();
        showStream(streams, "reserve");
      });
    });
  }
}

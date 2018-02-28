import Api from "./api/Api";
import UserThumbnails from "./modules/UserThumbnails";
import OfficialThumbnails from "./modules/OfficialThumbnails";
import Thumbnail from "./modules/Thumbnail";
import Search from "./modules/search";
import { showSpinner, hideSpinner } from "./modules/spinner";

// DOM を削除・非表示
const removeElements = elms => [...elms].forEach(el => el.remove());
const hideElements = elms => [...elms].forEach(el => (el.style.display = "none"));

document.getElementById("user").addEventListener("click", e => {
  changeTab("user");
  Api.loadCasts("user").then(streams => {
    showStream(streams, "user");
  });
});

document.getElementById("official").addEventListener("click", e => {
  changeTab("official");
  Api.loadCasts("official").then(streams => {
    showStream(streams, "official");
  });
});

document.getElementById("future").addEventListener("click", () => {
  changeTab("future");
  Api.loadCasts("future").then(streams => {
    showStream(streams, "future");
  });
});

document.getElementById("search").addEventListener("click", () => {
  changeTab("search");
  const search = new Search();
  search.loadHTML();
});

// 番組表示
const showStream = (streams, genre) => {
  let params;
  switch (genre) {
    case "user":
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
  params.forEach(param => {
    const frame = Thumbnail.createElement(param);
    container.appendChild(frame);
  });

  hideSpinner();
};

// タブ切り替え
const changeTab = genre => {
  const searchroot = document.querySelector("#search-root");
  if (searchroot) {
    searchroot.remove();
  }

  const ctnr = document.getElementById("container");
  ctnr.style.display = "block";

  removeElements(document.querySelectorAll(".community-hover-wrapper"));
  showSpinner();

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

Api.loadCasts("user").then(streams => {
  showStream(streams, "user");
});

// ツールチップが表示されたら，ツールチップにマウスオーバーしたときツールチップを非表示にする
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

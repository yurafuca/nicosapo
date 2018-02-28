import Api from "./api/Api";
import UserThumbnails from "./modules/UserThumbnails";
import OfficialThumbnails from "./modules/OfficialThumbnails";
import Thumbnail from "./modules/Thumbnail";
import Search from "./modules/search";

let currentTab = "user";

// DOM を削除・非表示
const removeElements = elms => [...elms].forEach(el => el.remove());
const hideElements = elms => [...elms].forEach(el => (el.style.display = "none"));

// ツールチップが表示されたら，ツールチップにマウスオーバーしたときツールチップを非表示にする
const observer = new MutationObserver((mutationRecords, _observer) => {
  Array.prototype.forEach.call(document.getElementsByClassName("tooltip"), el => {
    el.addEventListener("mouseover", () => {
      hideElements(document.getElementsByClassName("tooltip"));
    });
  });
});

observer.observe(document.getElementById("nicosapo"), {
  childList: true
});

// 番組表示
const showStream = (streams, genre) => {
  let params;
  switch (genre) {
    case "user":
      params = UserThumbnails.getParams(streams);
      break;
    case "official":
    case "future":
      params = OfficialThumbnails.getParams(streams);
      break;
  }
  const container = document.getElementById("container");
  params.forEach(param => {
    const thumbnail = Thumbnail.createElement(param);
    container.appendChild(thumbnail);
    new Tooltip(thumbnail.querySelector(".comu_thumbnail"), {
      placement: "top", // or bottom, left, right, and variations
      title: thumbnail.dataset.title,
      container: document.getElementById("nicosapo"),
      boundariesElement: document.getElementById("nicosapo")
    });
  });
  const loading = document.getElementById("loading");
  loading.style.display = "none";
};

// タブ切り替え
const selectTab = genre => {
  currentTab = genre;

  const searchroot = document.querySelector("#search-root");
  if (searchroot) {
    searchroot.remove();
  }

  const ctnr = document.getElementById("container");
  ctnr.style.display = "block";

  removeElements(document.querySelectorAll(".community-hover-wrapper"));
  const loading = document.getElementById("loading");
  loading.currentTime = 0;
  loading.style.display = "block";

  const allTabs = document.querySelectorAll(".tab");
  for (const tab of allTabs) {
    console.log(tab.className);
    tab.className = "tab non-selected";
  }
  const tab = document.querySelector(`#${genre}`);
  tab.className = "tab selected";
};

Api.loadCasts("user").then(streams => {
  showStream(streams, "user");
});

document.getElementById("user").addEventListener("click", e => {
  selectTab("user");
  Api.loadCasts("user").then(streams => {
    showStream(streams, "user");
  });
});

document.getElementById("official").addEventListener("click", e => {
  selectTab("official");
  Api.loadCasts("official").then(streams => {
    showStream(streams, "official");
  });
});

document.getElementById("future").addEventListener("click", () => {
  selectTab("future");
  Api.loadCasts("future").then(streams => {
    showStream(streams, "future");
  });
});

document.getElementById("search").addEventListener("click", () => {
  selectTab("search");
  const search = new Search();
  search.loadHTML();
});

/* global Tooltip */

import store from "store";
import Api from "../api/Api";
import { showSpinner, hideSpinner } from "./spinner";

const removeElements = elms => [...elms].forEach(el => el.remove());

export default class Search {
  initFavorites(favs = this.getCurrentFavorites()) {
    // 削除
    const favorites = document.querySelectorAll(".favorite-query");
    removeElements(favorites);

    // 追加
    favs.forEach(fav => {
      // use
      const use = document.createElement("span");
      use.className = "use";
      use.dataset.query = fav.query;

      // query
      // const q = document.createElement("span");
      // q.dataset.query = fav.query;

      // label
      const label = document.createElement("span");
      label.className = "query-label";
      label.innerText = fav.query_label;
      use.appendChild(label);

      // delete
      const del = document.createElement("span");
      del.className = this.getCurrentQuery() === fav.query ? "query-remove" : "query-remove none";
      del.innerText = "✕ 削除";
      del.addEventListener("click", el => {
        this.removeQuery(el.innerText);
        el.stopPropagation();
      });

      // rename
      const rename = document.createElement("span");
      rename.className = this.getCurrentQuery() === fav.query ? "query-rename" : "query-rename none";
      rename.innerText = "表示名を変更";
      rename.addEventListener("click", el => {
        this.beginQueryEditing(el);
        el.stopPropagation();
      });

      use.appendChild(rename);
      use.appendChild(del);

      // save
      const update = document.createElement("span");
      update.className = this.getCurrentQuery() === fav.query ? "query-update" : "query-update none";
      update.innerText = "✓ 完了";
      update.addEventListener("click", el => {
        this.finishQueryEditing(el, true);
        el.stopPropagation();
      });

      // cancel
      const cancel = document.createElement("span");
      cancel.className = this.getCurrentQuery() === fav.query ? "query-update-cancel" : "query-update-cancel none";
      cancel.innerText = "✗ キャンセル";
      cancel.addEventListener("click", el => {
        this.finishQueryEditing(el, false);
        el.stopPropagation();
      });

      // edit
      const edit = document.createElement("span");
      edit.className = "edit none";
      edit.addEventListener("click", el => {
        el.stopPropagation();
      });
      const input = document.createElement("input");
      input.className = "query-input";
      input.addEventListener("click", el => {
        el.stopPropagation();
      });
      edit.appendChild(input);
      edit.appendChild(update);
      edit.appendChild(cancel);

      // parent
      const parent = document.createElement("span");
      parent.className = "favorite-query";
      parent.appendChild(use);
      parent.appendChild(edit);

      parent.addEventListener("click", el => {
        this.onClickFavorite(use);
      });

      document.getElementById("favorite-query-list").appendChild(parent);
    });
  }

  initInput() {
    document.getElementById("search-input").value = this.getCurrentQuery();
  }

  initSortMode() {
    document.getElementById("search-sort").value = store.get("search.sortMode") || this.getCurrentSortMode();
  }

  onClickFavorite(el) {
    const query = el.dataset.query;
    document.getElementById("search-input").value = query;
    this.search(query);
  }

  onClickExclude(el) {
    const key = "search.item.exclude";
    const distributorId = el.currentTarget.dataset.distributorId;
    const excludeList = store.get(key) || [];
    const newItem = {
      id: distributorId,
      thumbnail: el.currentTarget.dataset.thumbnail,
      name: el.currentTarget.dataset.name,
      keyword: el.currentTarget.dataset.keyword
    };
    const removed = excludeList.filter(item => item.id !== newItem.id);
    const added = [...removed, newItem];
    store.set(key, added);

    this.removeExcludedDistributors();
  }

  setState(state) {
    for (const key in state) {
      this.state[key] = state[key];
    }
  }

  loadHTML() {
    fetch("../html/search.html")
      .then(data => data.text())
      .then(data => {
        const parser = new DOMParser();
        const html = parser.parseFromString(data, "text/html");
        const child = html.documentElement.querySelector("#search-root");
        document.querySelector("#container").prepend(child);
        hideSpinner();
        this.initInput();
        this.setEventListener();
        this.initSortMode();
        this.search();
      });
  }

  setEventListener() {
    document.querySelector("#search-sort").addEventListener("change", () => {
      this.changeSortMode();
    });
    document.querySelector("#search-input").addEventListener("keydown", e => {
      this.handleKeyPress(e);
    });
    document.querySelector("#search-button").addEventListener("click", () => {
      this.search();
    });
    document.querySelector("#regist-favorite").addEventListener("click", () => {
      this.registerFavorite();
    });
  }

  setParams(query, sortMode) {
    Api.search(query, sortMode).then(response => {
      const datas = response.values;
      const thumbParams = [];
      for (const data of datas) {

        const thumbParam = {};
        thumbParam.url = `https://live.nicovideo.jp/watch/${data.id}`;
        thumbParam.thumbnail = data.socialGroupThumbnailUrl;
        thumbParam.name = data.socialGroupName.replace(/\<.+\>/g, " ");
        thumbParam.title = data.title;
        thumbParam.viewCounter = data.statistics.watchCount;
        thumbParam.commentCounter = data.statistics.commentCount;
        thumbParam.memberOnly = data.isMemberOnly;
        const foo = new Date(data.beginAt);
        const bar = foo.getTime();
        const baz = new Date().getTime();
        const hoge = (baz - bar) / 1000 / 60;
        thumbParam.lapsedTime = parseInt(hoge);
        thumbParams.push(thumbParam);
      }

      const result = document.getElementById("search-result");

      thumbParams.forEach(params => {
        const element = this.getResultElement(params);
        result.appendChild(element);
      });

      this.removeExcludedDistributors();

      hideSpinner();
    });
  }

  getResultElement(props) {
    const { thumbnail, url, title, name, viewCounter, commentCounter, lapsedTime, memberOnly } = props;

    const isCannotBeExcluded = thumbnail === null;

    const re = /((co|ch)\d+)\.(jpg|png)/;
    const distributorId = isCannotBeExcluded ? "" : thumbnail.match(re)[1];

    const resultParent = document.createElement("div");
    resultParent.className = "listgroup-item clearfix";

    const resultChild = document.createElement("div");
    resultChild.className = "list-group-text-block float-left";

    const excludeButton = document.createElement("div");
    excludeButton.className = "exclude-button";
    excludeButton.textContent = "ミュート";
    excludeButton.dataset.memberOnly = memberOnly;
    excludeButton.dataset.distributorId = distributorId;
    excludeButton.dataset.thumbnail = thumbnail;
    excludeButton.dataset.name = name;
    excludeButton.dataset.keyword = this.getCurrentQuery();
    excludeButton.addEventListener("click", el => {
      this.onClickExclude(el);
    });

    new Tooltip(excludeButton, {
      placement: 'left', // or bottom, left, right, and variations
      title: "この配信者を検索結果からミュートする",
      template: '<div class="tooltip tooltip-small" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    });

    resultParent.appendChild(resultChild);

    if (!isCannotBeExcluded) {
      resultParent.appendChild(excludeButton);
    }

    const imgParent = document.createElement("a");
    imgParent.href = url;
    imgParent.target = "_blank";

    const badge = document.createElement("span");
    badge.className = "community-badge community-badge-small";
    badge.textContent = "コミュ限";

    const img = document.createElement("img");
    img.alt = "";
    img.className = "avatar";
    img.src = thumbnail;
    img.style.height = 55;
    img.style.width = 55;

    imgParent.appendChild(img);

    // 公式番組は null の場合がある
    if (memberOnly) {
      imgParent.appendChild(badge);
    }

    const titleParent = document.createElement("span");
    titleParent.className = "meta-title";

    const titleChild = document.createElement("a");
    titleChild.href = url;
    titleChild.target = "_blank";
    titleChild.className = "developer-app-name";
    titleChild.textContent = title;

    titleParent.appendChild(titleChild);

    const nameElem = document.createElement("span");
    nameElem.className = "meta-description text-small text-gray";
    nameElem.textContent = name;

    const br = document.createElement("br");

    const meta = document.createElement("span");
    meta.className = "meta-status text-small text-gray";
    meta.textContent = `${viewCounter} 来場者 · ${commentCounter} コメント · ${lapsedTime} 分経過`;

    resultChild.appendChild(imgParent);
    resultChild.appendChild(titleParent);
    resultChild.appendChild(nameElem);
    resultChild.appendChild(br);
    resultChild.appendChild(meta);

    return resultParent;
  }

  handleKeyPress(event) {
    const input = document.querySelector("#search-input");
    input.title = input.value;

    if (event.key === "Enter") {
      event.preventDefault();
      this.search();
    }
  }

  registerFavorite() {
    const q = this.getCurrentQuery();
    const queries = this.getCurrentFavorites().filter(favorite => q !== favorite.query);
    queries.push({
      query: q,
      query_label: q
    });
    store.set("search.query.favorites", queries);
    this.initFavorites(queries);
  }

  changeSortMode(e) {
    this.search();
    store.set("search.sortMode", this.getCurrentSortMode());
  }

  beginQueryEditing(el) {
    for (const e of document.querySelectorAll(".edit")) {
      e.classList.add("none");
    }

    el.currentTarget.parentNode.parentNode.querySelector(".edit").classList.remove("none");
    el.currentTarget.parentNode.parentNode.querySelector(".use").classList.add("none");

    const label = el.currentTarget.parentNode.parentNode.querySelector(".query-label").innerText;
    const input = el.currentTarget.parentNode.parentNode.querySelector(".query-input");
    input.value = label;
  }

  finishQueryEditing(el, shouldSave) {
    el.currentTarget.parentNode.parentNode.querySelector(".edit").classList.add("none");
    el.currentTarget.parentNode.parentNode.querySelector(".use").classList.remove("none");

    if (!shouldSave) {
      return;
    }

    // get label.
    const input = el.currentTarget.parentNode.parentNode.querySelector(".query-input");
    const label = el.currentTarget.parentNode.parentNode.querySelector(".query-label");
    const nextLabel = input.value;
    const currentLabel = label.innerText;

    // set nextLabel
    label.innerText = nextLabel;

    // set nextLabel to store.
    const favorites = store.get("search.query.favorites", {});
    const new_favorites = favorites.filter(f => {
      if (f.query_label === currentLabel) {
        f.query_label = nextLabel;
      }
      return f;
    });
    store.set("search.query.favorites", new_favorites);
  }

  removeQuery() {
    const q = this.getCurrentQuery();
    const queries = this.getCurrentFavorites().filter(favorite => q !== favorite.query);
    this.initFavorites(queries);
    store.set("search.query.favorites", queries);
  }

  getCurrentSortMode() {
    const el = document.querySelector("#search-sort");
    if (el.value) {
      return el.value;
    }

    const lastSortMode = store.get("search.sortMode");
    if (lastSortMode) {
      return lastSortMode;
    }

    return "startTime-dsc";
  }

  getCurrentQuery() {
    const el = document.getElementById("search-input");
    if (el.value) {
      return el.value;
    }

    const lastQuery = store.get("search.query.last");
    if (lastQuery) {
      return lastQuery;
    }

    return "雑談";
  }

  getCurrentFavorites() {
    const els = document.querySelectorAll(".favorite-query.use");
    if (els.length > 0) {
      const favorites = [];
      Array.prototype.forEach.call(els, el => {
        favorites.push({
          query: el.dataset.query,
          query_label: el.querySelector(".query-label").innerText
        });
      });
      return favorites;
    }

    const lastFavorites = store.get("search.query.favorites");
    if (lastFavorites) {
      return lastFavorites;
    }

    return [];
  }

  removeExcludedDistributors() {
    const resultArea = document.getElementById("search-result");
    const isEnableExcludeMemberOnly = store.get("options.excludeMemberOnly.enable") == "enable";

    // ミュートリスト
    const excludedDistributors = store.get("search.item.exclude") || [];
    const distributorIds = excludedDistributors.map(distributor => distributor.id);

    // 削除
    const communities = resultArea.childNodes;
    [...communities].forEach(community => {
      const excludeButton = community.querySelector(".exclude-button");
      if (excludeButton == null) {
        return false;
      }

      // コミュ限ミュートが有効になっていればコミュ限を削除
      const isMemberOnly = excludeButton.dataset.memberOnly == "true";
      if (isMemberOnly && isEnableExcludeMemberOnly) {
        community.remove();
        return;
      }

      // ミュートリストに登録されていれば削除
      const distributorId = excludeButton.dataset.distributorId;
      if (distributorIds.includes(distributorId)) {
        community.remove();
      }
    });

    // 0 件の旨を表示
    if (resultArea.childNodes.length === 0) {
      const query = this.getCurrentQuery();
      const message = document.createElement("div");
      message.className = "message";
      message.textContent = `「${query}」を含む放送中の番組はありません 😴`;
      resultArea.appendChild(message);
    }
  }

  search(query = this.getCurrentQuery()) {
    document.getElementById("search-result").innerHTML = "";
    showSpinner();

    this.setParams(query, this.getCurrentSortMode());

    this.initInput();
    this.initFavorites();

    store.set("search.query.last", query);
  }
}

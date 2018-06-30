import store from "store";
import Api from "../api/Api";
import { showSpinner, hideSpinner } from "./spinner";

const removeElements = elms => [...elms].forEach(el => el.remove());

export default class Search {
  initFavorites(queries = this.getCurrentFavorites()) {
    // 削除
    const favorites = document.querySelectorAll(".favorite-query");
    removeElements(favorites);

    // 追加
    queries.forEach(query => {
      const q = document.createElement("span");
      q.className = "favorite-query";
      q.dataset.query = query;
      q.textContent = query;

      q.addEventListener("click", el => {
        this.onClickFavorite(el);
      });

      const del = document.createElement("span");
      del.className = this.getCurrentQuery() == query ? "query-remove" : "query-remove none";
      del.textContent = "削除";

      del.addEventListener("click", el => {
        this.removeQuery(el.textContent);
        el.stopPropagation();
      });

      q.appendChild(del);

      document.getElementById("favorite-query-list").appendChild(q);
    });
  }

  initInput() {
    document.getElementById("search-input").value = this.getCurrentQuery();
  }

  initSortMode() {
    document.getElementById("search-sort").value = store.get("search.sortMode") || this.getCurrentSortMode();
  }

  onClickFavorite(el) {
    let query = "";
    for (const elem of el.currentTarget.childNodes) {
      if (elem.nodeName == "#text") {
        query += elem.nodeValue;
      }
    }
    document.getElementById("search-input").value = query;
    this.setQuery(query);
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
      this.registFavorite();
    });
  }

  setParams(query, sortMode) {
    Api.search(query, sortMode).then(response => {
      const datas = response.data;
      const thumbParams = [];
      for (const data of datas) {
        const thumbParam = {};
        thumbParam.url = `http://live.nicovideo.jp/watch/${data.contentId}`;
        thumbParam.thumbnail = data.communityIcon;
        thumbParam.description = data.description.replace(/\<.+\>/g, " ");
        thumbParam.title = data.title;
        thumbParam.viewCounter = data.viewCounter;
        thumbParam.commentCounter = data.commentCounter;
        const foo = new Date(data.startTime);
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

      if (thumbParams.length === 0) {
        const query = this.getCurrentQuery();
        const message = document.createElement("div");
        message.className = "message";
        message.textContent = `「${query}」を含む放送中の番組はありません 😴`;
        result.appendChild(message);
      }

      hideSpinner();
    });
  }

  getResultElement(props) {
    const { thumbnail, url, title, description, viewCounter, commentCounter, lapsedTime } = props;

    const resultParent = document.createElement("div");
    resultParent.className = "listgroup-item clearfix";

    const resutChild = document.createElement("div");
    resutChild.className = "list-group-text-block float-left";

    resultParent.appendChild(resutChild);

    const img = document.createElement("img");
    img.alt = "";
    img.className = "avatar";
    img.src = thumbnail;
    img.style.height = 55;
    img.style.width = 55;

    const titleParent = document.createElement("span");
    titleParent.className = "meta-title";

    const titleChild = document.createElement("a");
    titleChild.href = url;
    titleChild.target = "_blank";
    titleChild.className = "developer-app-name";
    titleChild.textContent = title;

    titleParent.appendChild(titleChild);

    const desc = document.createElement("span");
    desc.className = "meta-description text-small text-gray";
    desc.textContent = description;

    const br = document.createElement("br");

    const meta = document.createElement("span");
    meta.className = "meta-status text-small text-gray";
    meta.textContent = `${viewCounter} 来場者 · ${commentCounter} コメント · ${lapsedTime} 分経過`;

    resutChild.appendChild(img);
    resutChild.appendChild(titleParent);
    resutChild.appendChild(desc);
    resutChild.appendChild(br);
    resutChild.appendChild(meta);

    return resultParent;
  }

  handleKeyPress(event) {
    const input = document.querySelector("#search-input");
    input.title = input.value;

    if (event.key == "Enter") {
      event.preventDefault();
      this.search();
    }
  }

  registFavorite() {
    const q = this.getCurrentQuery();
    const queries = this.getCurrentFavorites().filter(query => q !== query);
    queries.push(q);
    store.set("search.query.favorite", queries);
    this.initFavorites(queries);
  }

  changeSortMode(e) {
    this.search();
    store.set("search.sortMode", this.getCurrentSortMode());
  }

  setQuery(query) {
    this.search(query);
  }

  removeQuery() {
    const q = this.getCurrentQuery();
    const queries = this.getCurrentFavorites().filter(query => q !== query);
    this.initFavorites(queries);
    store.set("search.query.favorite", queries);
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
    const els = document.querySelectorAll(".favorite-query");
    if (els.length > 0) {
      const favorites = [];
      Array.prototype.forEach.call(els, el => {
        favorites.push(el.dataset.query);
      });
      return favorites;
    }

    const lastFavorites = store.get("search.query.favorite");
    if (lastFavorites) {
      return lastFavorites;
    }

    return [];
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

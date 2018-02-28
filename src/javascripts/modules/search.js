import store from "store";
import Api from "../api/Api";

const removeElements = elms => [...elms].forEach(el => el.remove());

export default class Search {
  constructor() {
    const state = {
      programs: [],
      thumbParams: [],
      isLoading: true,
      resultCount: 0,
      query_current: store.get("search.query.last") || "雑談",
      query_last: store.get("search.query.last") || "",
      query_favorite: store.get("search.query.favorite") || [],
      sortMode: store.get("search.sortMode") || "startTime-dsc"
    };
    this.state = state;
  }

  initFavorites() {
    // 削除
    const favorites = document.querySelectorAll(".favorite-query");
    removeElements(favorites);

    // 追加
    this.state.query_favorite.forEach(query => {
      const q = document.createElement("span");
      q.className = "favorite-query";
      q.dataset.query = query;
      q.textContent = query;
      q.addEventListener("click", e => {
        let query = "";
        for (const elem of e.currentTarget.childNodes) {
          if (elem.nodeName == "#text") {
            query += elem.nodeValue;
          }
        }
        this.setQuery(query);
        document.getElementById("search-input").value = query;
      });

      const del = document.createElement("span");
      del.className = this.state.query_last == query ? "query-remove" : "query-remove none";
      del.textContent = "削除";

      q.appendChild(del);

      document.getElementById("favorite-query-list").appendChild(q);
    });
  }

  initInput() {
    document.getElementById("search-input").value = this.state.query_last;
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
        document.querySelector("#communities").appendChild(child);
        const container = document.getElementById("container");
        container.style.display = "none";
        const loading = document.getElementById("loading");
        loading.style.display = "none";
        this.setEventListener();
        this.initFavorites();
        this.initInput();
        this.search();
      });
  }

  setEventListener() {
    document.getElementById("search-sort").addEventListener("change", () => {
      this.handleChange();
    });
    document.getElementById("search-input").addEventListener("keydown", e => {
      this.handleKeyPress(e);
    });
    document.getElementById("search-button").onclick = this.search;
    document.getElementById("regist-favorite").onclick = this.registFavorite;
    document.getElementsByClassName("favorite-query").onclick = this.setQuery;
  }

  setParams(query, sortMode) {
    Api.search(query, sortMode).then(response => {
      const datas = response.data;
      const thumbParams = [];
      this.setState({ resultCount: datas.length });
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
      // this.setState({ thumbParams: thumbParams, isLoading: false });
      thumbParams.forEach(params => {
        const element = this.getResultElement(params);
        document.getElementById("search-result").appendChild(element);
      });
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
    img.style.height = 60;
    img.style.width = 60;

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

  handleChange(event) {
    this.setState({ query_current: event.target.value });
  }

  handleKeyPress(event) {
    if (event.key == "Enter") {
      event.preventDefault();
      this.search();
    }
  }

  registFavorite(e) {
    const q = this.state.query_current;
    const queries = this.state.query_favorite.filter(query => q !== query);
    queries.push(q);
    this.setState({ query_favorite: queries });
    store.set("search.query.favorite", queries);
  }

  changeSortMode(e) {
    this.setState({ sortMode: e.target.value }, this.search);
    store.set("search.sortMode", e.target.value);
  }

  setQuery(query) {
    this.search(query);
    this.initInput();
  }

  removeQuery() {
    const q = this.state.query_last;
    const queries = this.state.query_favorite.filter(query => q !== query);
    this.setState({ query_favorite: queries });
    store.set("search.query.favorite", queries);
  }

  getCurrentQuery() {
    return document.getElementById("search-input").value;
  }

  search(query = this.getCurrentQuery()) {
    document.getElementById("search-result").innerHTML = "";
    this.setParams(query, this.state.sortMode);
    this.initFavorites();
    store.set("search.query.last", query);
  }
}

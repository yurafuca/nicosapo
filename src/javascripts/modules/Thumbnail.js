/* global Tooltip */

const UPDATE_INTERVAL_MILLISEC = 1000;
const LOADING_TEXT = "loading..."

export default class Thumbnail {
  constructor() {
    this._element = null;
    this._key = "";
    this._preload = "";
    this._background = "";
    this._title = "";
    this._watchCount = LOADING_TEXT;
    this._commentCount = LOADING_TEXT;
    this.url = "";
    this._id = "";
    this._isReserved = false;
    this._isOfficial = false;
    this._text = "";
    this._day = "";
    this._openTime = ""; // 開始・開場
    this._openDate = ""; // 残り時間用
    this._index = "";
  }

  createElement() {
    const thumbnail = document.createElement("div");
    thumbnail.id = this._id;
    thumbnail.className = "community-hover-wrapper";
    thumbnail.dataset.toggle = "tooltip";
    thumbnail.dataset.placement = "top";
    thumbnail.dataset.title = this._title;

    const outer = document.createElement("div");
    outer.className = "side-corner-tag disabled";

    const inner = document.createElement("div");
    inner.className = "community";

    const a = document.createElement("a");
    a.href = this._url;
    a.target = "_blank";

    const span = document.createElement("span");
    span.className = "comu_thumbnail";
    span.style.backgroundImage = this._background;

    this._element = thumbnail;

    thumbnail.appendChild(outer);
    outer.appendChild(inner);
    inner.appendChild(a);
    a.appendChild(span);

    if (this._isReserved && this._isOfficial === false) {
      const openDay = document.createElement("p");
      openDay.innerHTML = `<span class="reserved-message">${this._day}</span>`;

      outer.className = "side-corner-tag enabled";
      outer.appendChild(openDay);
    }

    this._elapsedTime = this.getElapsedTime();

    setInterval(() => {
      this._elapsedTime = this.getElapsedTime();
    }, UPDATE_INTERVAL_MILLISEC);

    this.setTooltip(this._element, this.createTooltipOptions());

    return this._element;
  }

  getElapsedTime() {
    const currentDate = new Date();
    const elapsedTime = parseInt((currentDate.getTime() - this._openDate.getTime()) / 1000);

    let h = parseInt(elapsedTime / 3600);
    let m = parseInt((elapsedTime / 60) % 60) - 1;
    let s = parseInt(elapsedTime % 60);

    if (m < 10)
      m = `0${m}`;

    if (s < 10)
      s = `0${s}`;

    if (h > 0)
      h = `${h}:`
    else
      h = '';

    return `${h}${m}:${s}`;
  }

  createTooltipOptions() {
    const titleHTML = `<span>${this._title}</span>`;

    const openTimeHTML = this._isReserved === true ? `<span class="tooltip-opentime">${this._openTime}</span><br>` : '';


    const counterHTML = this._isReserved === false ? `
      <br>
      <span class="statistics">
        <img class="watch-count" src="/images/baseline_person_white_18dp.png" />
        <span class="watch-count-value">${this._watchCount}</span>
        <img class="view-count" src="/images/baseline_comment_white_18dp.png" />
        <span class="view-count-value">${this._commentCount}</span>
        <img class="elapsed-time" src="/images/baseline_access_time_white_18dp.png" />
        <span class="elapsed-time-value">${this._elapsedTime}</span>
      </span>
    ` : '';

    const tooltipHTML = `
      ${openTimeHTML}
      ${titleHTML}
      ${counterHTML}
    `;

    // ツールチップがサムネイルと重なった場合はツールチップを上方に移動する
    const modefier = data => {
      const tooltip = data.instance.popper;
      const clientHeight = tooltip.clientHeight;

      const updatePosition = () => {
        if (this._index < 6) {
          if (clientHeight > 90)
            tooltip.style.top = "-32px";
          else if (clientHeight > 70)
            tooltip.style.top = "-12px";
        }
      }

      const tooltipInnnerElement = new DOMParser().parseFromString(tooltip.innerHTML, 'text/html');
      const statistics = tooltipInnnerElement.querySelector(".statistics");

      const updateStatistics = () => {
        statistics.querySelector(".watch-count-value").textContent = this._watchCount;
        statistics.querySelector(".view-count-value").textContent = this._commentCount;
        statistics.querySelector(".elapsed-time-value").textContent = this._elapsedTime;
        tooltip.childNodes[1].childNodes[5].outerHTML = statistics.outerHTML;
      }

      updatePosition();

      const timer = setInterval(() => {
        if (this._watchCount != LOADING_TEXT) {
          updateStatistics();
          clearInterval(timer);
        }
      }, 1);

      setInterval(() => {
        updateStatistics();
      }, UPDATE_INTERVAL_MILLISEC);
    };

    const options = {
      placement: "top",
      html: true,
      title: tooltipHTML,
      container: document.querySelector("#nicosapo"),
      popperOptions: {
        // 強制的に top に表示する
        // https://github.com/FezVrasta/popper.js/issues/354
        modifiers: {
          flip: {
            enabled: false
          },
          preventOverflow: {
            boundariesElement: document.querySelector("body")
          }
        },
        onCreate: modefier,
        onUpdate: modefier
      }
    };

    return options;
  }

  setTooltip(reference, options) {
    return new Tooltip(reference, options);
  }

  setParams(params) {
    const {
      key,
      preload,
      background,
      title,
      watchCount,
      commentCount,
      url,
      id,
      isReserved,
      isOfficial,
      text,
      day,
      openTime,
      openDate,
      index
    } = params;

    this._key = key || this._key;
    this._preload = preload || this._preload;
    this._background = background || this._background;
    this._title = title || this._title;
    this._watchCount = watchCount || this._watchCount;
    this._commentCount = commentCount || this._commentCount;
    this._url = url || this._url;
    this._id = id || this._id;
    this._isReserved = isReserved || this._isReserved;
    this._isOfficial = isOfficial || this._isOfficial;
    this._text = text || this._text;
    this._day = day || this._day;
    this._openTime = openTime || this._openTime;
    this._openDate = openDate || this._openDate;
    this._index = index || this._index;
  }
}
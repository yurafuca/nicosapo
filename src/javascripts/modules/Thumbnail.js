/* global Tooltip */
import Api from "../api/Api";

const UPDATE_INTERVAL_MILLISEC = 1000;
const LOADING_TEXT = "loading"

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

    this._isRequireRSS = true;

    this._isCreated = false;
    this._isBeforeRerender = true;

    this._loadingDots = "&nbsp;&nbsp;&nbsp;";
  }

  setParams(params) {
    for (const param in params) {
      if (param != null)
        this[`_${param}`] = params[param];
    }
  }

  createElement() {
    const parser = new DOMParser();
    this._element = parser.parseFromString(`
      <div
        id="${this._id}"
        class="community-tile community-hover"
        data-toggle="tooltip"
        data-placement="top"
        data-title="${this._title}"
      >
        <div class="side-corner-tag disabled">
          <div class="community">
            <a
              href="${this._url}"
              target="_blank">
              <span
                class="comu_thumbnail"
                style="background-image:${this._background}"
            </a>
          </div>
        </div>
      </div>
    `,
        'text/html'
      )
      .childNodes[0].querySelector('body').childNodes[0];

    if (this._isReserved && this._isOfficial === false) {
      const openDay = document.createElement("p");
      openDay.innerHTML = `<span class="community-badge">${this._day}</span>`;
      const div = this._element.querySelector(".side-corner-tag");
      div.className = "side-corner-tag enabled";
      div.appendChild(openDay);
    }

    this.setTooltip(this._element, this.createTooltipOptions());

    return this._element;
  }

  getElapsedTime() {
    const currentDate = new Date();
    const elapsedTime = parseInt((currentDate.getTime() - this._openDate.getTime()) / 1000);

    let h = parseInt(elapsedTime / 3600);
    let m = parseInt((elapsedTime / 60) % 60);
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
      this.recalcTop(tooltip);

      const updater1 = () => {
        const timer = setInterval(() => {
          this.setStatistics(tooltip, this._watchCount, this._commentCount, this.getElapsedTime());
          this._isBeforeRerender = false;
          if (this.isFetched()) {
            clearInterval(timer);
            data.instance.update();
          }
        }, 1);
      }

      const updater2 = () => {
        const timer = setInterval(() => {
          if (this._loadingDots.includes("&nbsp;"))
            this._loadingDots = this._loadingDots.replace("&nbsp;", ".");
          else
            this._loadingDots = "&nbsp;&nbsp;&nbsp;";
          if (this.isFetched()) {
            clearInterval(timer);
          }
        }, 100);
      }

      const updater3 = () => {
        this.setStatistics(tooltip, this._watchCount, this._commentCount, this.getElapsedTime());
        const timer = setInterval(() => {
          this.setStatistics(tooltip, this._watchCount, this._commentCount, this.getElapsedTime());
          if (this.isHidden(tooltip)) {
            clearInterval(timer); // for in
          }
        }, 1000);
      }

      if (this._isBeforeRerender) {
        updater1();
        if (this._isRequireRSS)
          this.fetchFromRSS();
        if (!this.isCreated())
          updater2();
      } else {
        updater3();
      }

      this._isCreated = true;

    }

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

  setStatistics(tooltip, watchCount, commentCount, elapsedTime) {
    const tooltipInnnerElement = new DOMParser().parseFromString(tooltip.innerHTML, 'text/html');
    const statistics = tooltipInnnerElement.querySelector(".statistics");

    if (statistics == null)
      return;

    let watchCountText = "";
    if (this.isFetched())
      watchCountText = watchCount;
    else
      watchCountText = LOADING_TEXT + this._loadingDots;

    let commentCountText = "";
    if (this.isFetched())
      commentCountText = commentCount;
    else
      commentCountText = LOADING_TEXT + this._loadingDots;

    statistics.querySelector(".watch-count-value").innerHTML = watchCountText;
    statistics.querySelector(".view-count-value").innerHTML = commentCountText;
    statistics.querySelector(".elapsed-time-value").innerHTML = elapsedTime;

    tooltip.childNodes[1].childNodes[5].outerHTML = statistics.outerHTML;
  }

  fetchFromRSS() {
    Api.fetchVideoStatistics(this._id, "apiv2", this._title).then((res) => {
      if (res.data.data.length === 0)
        return;
      if (this.isFetched()) {
        console.log(1);
        return;
      }
      const {
        viewCounter,
        commentCounter
      } = res.data.data[0];
      this.setParams({
        watchCount: viewCounter.toString(),
        commentCount: commentCounter.toString()
      });
    });
  }

  recalcTop(tooltip) {
    const clientHeight = tooltip.clientHeight;

    let top = 0;

    if (this._index < 6) {
      if (clientHeight > 90)
        top = "-32px";
      else if (clientHeight > 70)
        top = "-12px";
    }

    tooltip.style.top = top;
  }

  isCreated() {
    return this._isCreated;
  }

  isFetched() {
    return this._watchCount !== LOADING_TEXT;
  }

  isHidden(tooltip) {
    if (!this._isCreated)
      return true;
    if (tooltip.getAttribute('aria-hidden') === 'true')
      return true;
    return false;
  }

  setTooltip(reference, options) {
    return new Tooltip(reference, options);
  }
}
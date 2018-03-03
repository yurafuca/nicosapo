/* global Tooltip */

const TOOLTIP_OFFSET_TOP_PX = 10;

export default class Thumbnail {
  static createElement(params) {
    const { key, preload, background, title, url, id, isReserved, text, day, openTime, index } = params;

    const thumbnail = document.createElement("div");
    thumbnail.id = id;
    thumbnail.className = "community-hover-wrapper";
    thumbnail.dataset.toggle = "tooltip";
    thumbnail.dataset.placement = "top";
    thumbnail.dataset.title = title;

    const outer = document.createElement("div");
    outer.className = "side-corner-tag disabled";

    const inner = document.createElement("div");
    inner.className = "community";

    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";

    const span = document.createElement("span");
    span.className = "comu_thumbnail";
    span.style.backgroundImage = background;

    let tooltipHTML = `<span>${title}</span>`;
    if (openTime) {
      tooltipHTML = `
        <span class="tooltip-opentime">
          ${openTime}
        </span>
        <br>
        ${tooltipHTML}
      `;
    }

    // ツールチップがサムネイルと重なった場合はツールチップを上方に移動する
    const modefier = data => {
      // サムネイルの絶対座標
      const thumbnail = data.instance.reference;
      const thumbnailRect = thumbnail.getBoundingClientRect();
      const thumbnailTop = window.pageYOffset + thumbnailRect.top;

      // ツールチップの絶対座標
      const tooltip = data.instance.popper;
      const arrow = tooltip.querySelector(".tooltip-arrow");
      const arrowRect = arrow.getBoundingClientRect();
      const arrowBottom = window.pageYOffset + arrowRect.bottom;

      // 重なり判定
      if (thumbnailTop < arrowBottom) {
        // サムネイルの上端とツールチップの上端を合わせる
        // => ツールチップの高さだけ上方に移動する
        // => 微調整
        tooltip.style.top = `${thumbnailTop - tooltip.clientHeight - TOOLTIP_OFFSET_TOP_PX}px`;
      }
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

    const tooltip = Thumbnail.setTooltip(span, options);

    thumbnail.appendChild(outer);
    outer.appendChild(inner);
    inner.appendChild(a);
    a.appendChild(span);

    if (isReserved) {
      const openDay = document.createElement("p");
      openDay.innerHTML = `<span class="reserved-message">${day}</span>`;

      outer.className = "side-corner-tag enabled";
      outer.appendChild(openDay);
    }

    return thumbnail;
  }

  static setTooltip(reference, options) {
    return new Tooltip(reference, options);
  }
}

import $ from "jquery";

export default class FormatNicoPage {
  constructor() {
    this.$program_icon = $(".program_icon");
    this.$program_title = $(".program-title");
    this.$watch_title_box_meta = $("#watch_title_box .meta");
    this.$slider_container = $("#slider_container");
  }

  exec(pageType) {
    switch (pageType) {
      case "STAND_BY_PAGE":
        this.$program_title.css("display", "inline");
        break;
      case "GATE_PAGE":
        this.$program_icon.css("float", "none");
        this.$program_icon.css("display", "inline-block");
        this.$program_title.css("display", "inline-block");
        this.$program_title.attr("title", this.$program_title.text());
        break;
      case "OFFICIAL_CAST_PAGE": // 公式放送は必ず新配信でおこなわれる
      case "MODERN_CAST_PAGE":
      case "MODERN_TIME_SHIFT_PAGE":
        $(".program-detail").css("width", "930px");
        $("div[class^='___provider-detail___']").css("display", "-webkit-box");
        break;
      case "CHIMERA_CAST_PAGE":
        $(".program-title")
          .next()
          .css("width", "950px");
        $("div[class^='___player-head-area___']").css("margin", 0);
        $("div[class^='___player-body-area___']").css("margin", 0);
        $("#program-social-block").css("position", "relative");
        $("#program-social-block").css("bottom", "10px");
        $("#program-social-block").css("top", "auto");
        $("#program-social-block").css("z-index", "-9");
        $("#nicosapo_buttons").css("top", 0);
        break;
      case "NORMAL_CAST_PAGE":
      case "TIME_SHIFT_PAGE":
        $("#extended-bar").css("width", "650px");
        $("div[class^='___player-head-area___']").css("margin-top", "0");
        this.$watch_title_box_meta.css("width", "1000px");
        this.$slider_container.css("padding", "0");
        break;
      default:
        // Do nothing.
    }

    if (pageType === "OFFICIAL_CAST_PAGE") {
      $("div[class^='___player-head-area___']").css("margin-bottom", "0");
      $("div[class^='___player-body-area___']").css("margin-top", "0");
    }
  }
}
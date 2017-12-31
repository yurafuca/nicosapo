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
      case "MODERN_CAST_PAGE":
        $(".program-detail").css("width", "930px");
        $("#program-social-block").css("bottom", "30px");
        break;
      case "NORMAL_CAST_PAGE": // Fall through.
      case "OFFICIAL_CAST_PAGE": // Fall through.
      case "TIME_SHIFT_PAGE":
        this.$watch_title_box_meta.css("width", "1000px");
        this.$slider_container.css("padding", "0"); // For ExBar
        break;
      default:
      // Do nothing.
    }
  }
}

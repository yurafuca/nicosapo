import $ from 'jquery'

export default class FormatNicoPage {
  constructor() {
    this.$program_icon = $('.program_icon');
    this.$program_title = $('.program-title');
    this.$watch_title_box_meta = $('#watch_title_box .meta');
    this.$slider_container = $('#slider_container');
  }

  exec(pageType) {
    if (pageType == 'STAND_BY_PAGE') {
      this.$program_title.css('display', 'inline');
      return;
    } else if (pageType == 'GATE_PAGE') {
      this.$program_icon.css('float', 'none');
      this.$program_icon.css('display', 'inline-block');
      this.$program_title.css('display', 'inline-block');
      this.$program_title.attr('title', this.$program_title.text());
      return;
    } else if (pageType == 'MODERN_CAST_PAGE') {
      // Do nothing.
      return;
    } else if (pageType == 'NORMAL_CAST_PAGE' || pageType == 'OFFICIAL_CAST_PAGE') {
      this.$watch_title_box_meta.css('width', '1000px');
      this.$slider_container.css('padding', '0'); // For ExtendedBar
      return;
    }
  }
}

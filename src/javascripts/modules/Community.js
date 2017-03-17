import $ from 'jquery';

export default class Community {
  constructor() {
    this.content = $(this._xml());
    this.table = {
      id:        `id`,
      thumbnail: `thumbnail`,
    }
  }

  set(prop, value) {
    this.content.find(this.table[prop]).text(value);
  }

  get(prop) {
    return this.content.find(this.table[prop]).text();
  }

  xml() {
    return this.content;
  }

  _xml() {
    return `
      <community>
        <id></id>
        <name></name>
        <channel_id/>
        <global_id></global_id>
        <thumbnail></thumbnail>
        <thumbnail_small></thumbnail_small>
      </community>
    `
  }
}

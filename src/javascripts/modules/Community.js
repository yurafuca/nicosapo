// import $ from "jquery";

export default class Community {
  constructor() {
    const parser = new DOMParser();
    const xml = parser.parseFromString(this._xml(), "text/xml");
    // this.content = $(this._xml());
    this.content = xml;
    this.table = {
      id: `id`,
      thumbnail: `thumbnail`
    };
  }

  set(prop, value) {
    // this.content.find(this.table[prop]).text(value);
    this.content.querySelector(this.table[prop]).textContent = value;
  }

  get(prop) {
    // return this.content.find(this.table[prop]).text();
    return this.content.querySelector(this.table[prop]).textContent;
  }

  xml() {
    return this.content.documentElement;
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
    `;
  }
}

/*global describe, it, before */

import { expect } from "chai";

import jsdom from "jsdom";
import jquery from "jquery";

const { JSDOM } = jsdom;
const { window } = new JSDOM("<html></html>");
const $ = jquery(window);

import Api from "../src/javascripts/api/Api2";
import favoriteOnair from "./seeds/api.favorites.onair.json";
import favoriteComingsoon from "./seeds/api.favorites.comingsoon.json";

describe("API のテスト", () => {
  it("# 予約番組なし", () => {
    const _streams = Api.formatFavorites(favoriteOnair.favoriteStreams);
    const stream = _streams[0];
    expect(stream.preload).to.be.a("boolean");
    expect(stream.background).to.be.a("string");
    expect(stream.title).to.be.a("string");
    expect(stream.url).to.be.a("string");
    expect(stream.id).to.be.a("number");
    expect(stream.isReserved).to.equal(false);
    expect(stream.text).to.be.a("string");
    expect(stream.day).to.be.a("string");
    expect(stream.openTime).to.be.a("number");
    expect(stream.index).to.be.a("number");
  });

  it("# 予約番組のみ", () => {
    const _streams = Api.formatFavorites(favoriteComingsoon.favoriteStreams);
    const stream = _streams[0];
    expect(stream.preload).to.be.a("boolean");
    expect(stream.background).to.be.a("string");
    expect(stream.title).to.be.a("string");
    expect(stream.url).to.be.a("string");
    expect(stream.id).to.be.a("number");
    expect(stream.isReserved).to.equal(true);
    expect(stream.text).to.be.a("string");
    expect(stream.day).to.be.a("string");
    expect(stream.openTime).to.be.a("number");
    expect(stream.index).to.be.a("number");
  });
});

/*global describe, it, before, beforeEach */
import Db from "../src/javascripts/modules/Db";
import { expect, assert } from "chai";
import store from "store";

describe("Db", () => {
  beforeEach(done => {
    store.clearAll();
    const obj = {};
    obj["co0"] = {};
    obj["co0"].state = `offair`;
    obj["co0"].thumbnail = `http://icon.nimg.jp/community/44/co443753.jpg`;
    obj["co0"].title = `TITLE_1`;
    obj["co0"].owner = `OWNER_1`;
    obj["co1"] = {};

    obj["co1"].state = `offair`;
    obj["co1"].thumbnail = `http://icon.nimg.jp/community/44/co443754.jpg`;
    obj["co1"].title = `TITLE_2`;
    obj["co1"].owner = `OWNER_2`;
    obj["co2"] = {};

    obj["co2"].state = `offair`;
    obj["co2"].thumbnail = `http://icon.nimg.jp/community/44/co443755.jpg`;
    obj["co2"].title = `TITLE_3`;
    obj["co2"].owner = `OWNER_3`;
    store.set(`autoEnterCommunityList`, obj);
    done();
  });

  it("#setAll", () => {
    Db.setAll("autoEnterCommunityList", "state", "init");
    const items = store.get("autoEnterCommunityList");
    Object.keys(items).forEach(id => {
      expect(items[id]).to.contain.all.keys({ state: "init" });
    });
  });

  it("#contains: 無効な target を指定した場合は例外を投げる", () => {
    expect(() => {
      Db.contains(`xxxxxxx`, `ooo`);
    }).to.throw("xxxxxx is illegal target");
  });

  it("#contains: キーを含む場合は true を返却する．", () => {
    const contains = Db.contains(`autoEnterCommunityList`, `co1`);
    expect(contains).to.equal(true);
  });

  it("#contains: キーを含まない場合は false を返却する．", () => {
    const contains = Db.contains(`autoEnterCommunityList`, `co99999999`);
    expect(contains).to.equal(false);
  });
});

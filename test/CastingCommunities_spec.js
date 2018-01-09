/*global describe, it, before */

import { expect } from "chai";
import { jsdom } from "jsdom";
const document = jsdom("<div/");
const window = document.defaultView;
import jQuery from "jquery";
const $ = jQuery(window);
import VideoInfos from "../test/VideoInfos";
import CastingCommunities from "../src/javascripts/modules/CastingCommunities";

const castingCommunities = new CastingCommunities();
const videoInfo = VideoInfos.getString();

const videoInfosHash_previous = {};
const videoInfosHash_current = {};

describe("CastingComunities", () => {
  before(done => {
    const $vi1 = new $(videoInfo);
    $vi1.find("video open_time_jpstr").text("time0");
    $vi1.find("community id").text("000000");

    const $vi2 = new $(videoInfo);
    $vi2.find("video open_time_jpstr").text("time1");
    $vi2.find("community id").text("111111");

    const $vi3 = new $(videoInfo);
    $vi3.find("video open_time_jpstr").text("time2");
    $vi3.find("community id").text("222222");

    const $vi4 = new $(videoInfo);
    $vi4.find("video open_time_jpstr").text("time3");
    $vi4.find("community id").text("333333");

    const $vi5 = new $(videoInfo);
    $vi5.find("video open_time_jpstr").text("time4");
    $vi5.find("community id").text("444444");

    videoInfosHash_previous["000000"] = $vi1;
    videoInfosHash_previous["111111"] = $vi2;
    videoInfosHash_previous["222222"] = $vi3;

    videoInfosHash_current["000000"] = $vi1;
    videoInfosHash_current["111111"] = $vi2;
    videoInfosHash_current["222222"] = $vi3;
    videoInfosHash_current["333333"] = $vi4;
    videoInfosHash_current["444444"] = $vi5;

    castingCommunities.push(videoInfosHash_previous);
    castingCommunities.push(videoInfosHash_current);

    done();
  });
  it("#ALL は現在放送中の id の Object を返却する．", () => {
    const all = castingCommunities.query("ALL");
    const ids = Object.keys(all).sort();
    expect(ids).to.eql(["000000", "111111", "222222", "333333", "444444"]);
  });
  it("#ONLY_JUST_FOLLOWED はフォローしたばかりの id の Array を返却する．", () => {
    const started_1 = castingCommunities.query("ONLY_JUST_STARTED");
    const ids = Object.keys(started_1);
    expect(ids).to.eql(["333333", "444444"]);
  });
});

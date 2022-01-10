import store from "store";
import NiconamaTabs from "../modules/NiconamaTabs";
import { CommunityBuilder, ProgramBuilder } from '../modules/ManageableBuilder';
import bucket from "../modules/Bucket"
import Api from '../api/Api';

export const ON_VISIT = "ON_VISIT";
export const ON_LEAVE = "ON_LEAVE";

export const SHOULD_MOVE_AUTOMATICALLY = "SHOULD_MOVE_AUTOMATICALLY";
export const SHOULD_NOT_MOVE_AUTOMATICALLY = "SHOULD_NOT_MOVE_AUTOMATICALLY";
export const SHOULD_OPEN_COMMUNITY_AUTOMATICALLY = "SHOULD_OPEN_COMMUNITY_AUTOMATICALLY";
export const SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY = "SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY";

export const API_GET_PROGRAM_STATUS = "API_GET_PROGRAM_STATUS";
export const API_GET_LATEST_PROGRAM = "API_GET_LATEST_PROGRAM";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.purpose === API_GET_PROGRAM_STATUS) {
    Api.getProgramStatus(request.programId).then(response => {
      sendResponse(response);
    });
    return true;
  }

  if (request.purpose === API_GET_LATEST_PROGRAM) {
    Api.getProgramStatus(request.communityId).then(response => {
      sendResponse(response);
    });
    return true;
  }

  if (request.purpose == "NiconamaTabs.add") {
    NiconamaTabs.add(sender.tab.id, request.id, request.scrollTop);
  }

  if (request.purpose == "NiconamaTabs.remove") {
    NiconamaTabs.remove(sender.tab.id);
  }

  if (request.purpose == "NiconamaTabs.get") {
    sendResponse(NiconamaTabs.get(sender.tab.id));
  }

  if (request.purpose == "getFromLocalStorage") {
    sendResponse(store.get(request.key));
    return;
  }

  if (request.purpose == "saveToLocalStorage") {
    store.set(request.key, request.value);
    return;
  }

  if (request.purpose == "removeFromLocalStorage") {
    store.remove(request.key);
    return;
  }

  if (request.purpose == "getFromNestedLocalStorage") {
    let storagedData = {};
    if (store.get(request.key)) {
      storagedData = store.get(request.key);
    }
    sendResponse(storagedData);
  }

  // localStorage->{id->{state, test, ...}, id->{state, test, ...}}
  if (request.purpose == "saveToNestedLocalStorage") {
    let storagedData = {};
    if (store.get(request.key)) {
      storagedData = store.get(request.key);
    }
    storagedData[request.innerKey] = {};
    storagedData[request.innerKey].state = request.innerValue.state;
    storagedData[request.innerKey].thumbnail = request.innerValue.thumbnail;
    storagedData[request.innerKey].title = request.innerValue.title;
    if (request.innerValue.openDate) {
      storagedData[request.innerKey].openDate = request.innerValue.openDate;
    }
    if (request.innerValue.owner) {
      storagedData[request.innerKey].owner = request.innerValue.owner;
    }
    store.set(request.key, storagedData);

    if (request.key == "autoEnterCommunityList") {
      const builder = new CommunityBuilder()
        .id(request.innerKey)
        .title(request.innerValue.thumbnail)
        .thumbnailUrl(request.innerKey.thumbnail)
        .shouldOpenAutomatically(true);
      bucket.touchCommunity(builder);
    }

    if (request.key == "autoEnterProgramList") {
      const community = new CommunityBuilder()
        .id(request.innerValue.communityId)
        // .title(metaData.title)
        .thumbnailUrl(request.innerValue.thumbnail);
      const program = new ProgramBuilder()
        .id(request.innerKey)
        .title(request.innerValue.title)
        .shouldOpenAutomatically(true);
      // Do not use "touchBoth" instead of "appointBoth" !
      bucket.appointBoth(community, program);
    }

    return;
  }

  if (request.purpose === `get`) {
    sendResponse(store.get(request.key));
  }

  if (request.purpose === `save`) {
    store.set(request.key, request.value);
    sendResponse();
  }

  if (request.purpose === `remove`) {
    store.remove(request.key);
    sendResponse();
  }

  if (request.purpose == "removeFromNestedLocalStorage") {
    let storagedData = {};
    if (store.get(request.key)) {
      storagedData = store.get(request.key);
    }
    console.info(
      "[nicosapo] Delete storagedData[innerKey] ",
      storagedData[request.innerKey]
    );
    delete storagedData[request.innerKey];
    store.set(request.key, storagedData);

    if (request.key == "autoEnterCommunityList") {
      const builder = new CommunityBuilder()
        .id(request.innerKey)
        .shouldOpenAutomatically(false);
      bucket.touchCommunity(builder);
    }

    if (request.key == "autoEnterProgramList") {
      const community = new CommunityBuilder()
        .id(request.innerValue.communityId);
      const program = new ProgramBuilder()
        .id(request.innerKey)
        .shouldOpenAutomatically(false);
      // Do not use "touchBoth" instead of "appointBoth" !
      bucket.appointBoth(community, program);
    }
  }

  if (request.purpose === ON_VISIT) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId);
    const program = createSimpleProgramBuilder(metaData, metaData.programId)
      .isVisiting(true)
      .isVisited(true)
      .shouldMoveAutomatically(false);
    bucket.touchBoth(community, program);
  }

  if (request.purpose === ON_LEAVE) {
    const metaData = request.metaData;
    const program = createSimpleProgramBuilder(metaData, metaData.programId).isVisiting(false);
    bucket.touchProgram(program);
  }

  if (request.purpose === SHOULD_MOVE_AUTOMATICALLY) {
    const metaData = request.metaData;
    const program = createSimpleProgramBuilder(metaData, metaData.programId).shouldMoveAutomatically(true);
    bucket.touchProgram(program);
  }

  if (request.purpose === SHOULD_NOT_MOVE_AUTOMATICALLY) {
    const metaData = request.metaData;
    const program = createSimpleProgramBuilder(metaData, metaData.programId).shouldMoveAutomatically(false);
    bucket.touchProgram(program);
  }

  if (request.purpose === SHOULD_OPEN_COMMUNITY_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId).shouldOpenAutomatically(true);
    bucket.touchCommunity(community);
  }


  if (request.purpose === SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId).shouldOpenAutomatically(false);
    bucket.touchCommunity(community);
  }
});

const createSimpleResponse = statusResponse => {
  const endTime = statusResponse.querySelector("stream end_time");
  const endTimeText = endTime != null ? endTime.textContent : null;
  const endTimeSecond = endTimeText != null ? Number(endTimeText) : null;
  const endTimeMilliSecond = endTimeSecond != null ? endTimeSecond * 1000 : null;
  return {
    endTimeSecond: endTimeSecond,
    endTimeMilliSecond: endTimeMilliSecond,
  };
};

const createSimpleCommunityBuilder = (metaData, id) => {
  const builder = new CommunityBuilder().id(id);
  if (metaData.title) {
    builder.title(metaData.title);
  }
  if (metaData.thumbnailUrl) {
    builder.thumbnailUrl(metaData.thumbnailUrl);
  }
  return builder;
};

const createSimpleProgramBuilder = (metaData, id) => {
  const builder = new ProgramBuilder().id(id);
  if (metaData.title) {
    builder.title(metaData.title);
  }
  return builder;
};
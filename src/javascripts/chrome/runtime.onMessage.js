import store from "store";
import NiconamaTabs from "../modules/NiconamaTabs";
import { CommunityBuilder, ProgramBuilder } from '../modules/ManageableBuilder';
import bucket from "../modules/Bucket"

export const ON_VISIT = "ON_VISIT";
export const ON_LEAVE = "ON_LEAVE";
export const SHOULD_MOVE_AUTOMATICALLY = "SHOULD_MOVE_AUTOMATICALLY";
export const SHOULD_NOT_MOVE_AUTOMATICALLY = "SHOULD_NOT_MOVE_AUTOMATICALLY";
export const SHOULD_OPEN_COMMUNITY_AUTOMATICALLY = "SHOULD_OPEN_COMMUNITY_AUTOMATICALLY";
export const SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY = "SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
      bucket.touch(builder);
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
      // Do not use "assign" instead of "appoint" !
      bucket.appoint(community, program);
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
      bucket.touch(builder);
    }

    if (request.key == "autoEnterProgramList") {
      const community = new CommunityBuilder()
        .id(request.innerValue.communityId);
      const program = new ProgramBuilder()
        .id(request.innerKey)
        .shouldOpenAutomatically(false);
      // Do not use "assign" instead of "appoint" !
      bucket.appoint(community, program);
    }
  }

  if (request.purpose === ON_VISIT) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId);
    const program = createSimpleProgramBuilder(metaData, metaData.programId)
      .isVisiting(true)
      .isVisited(true)
      .shouldMoveAutomatically(false);
    bucket.assign(community, program);
  }

  if (request.purpose === ON_LEAVE) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId);
    const program = createSimpleProgramBuilder(metaData, metaData.programId).isVisiting(false);
    bucket.assign(community, program);
  }

  if (request.purpose === SHOULD_MOVE_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId);
    const program = createSimpleProgramBuilder(metaData, metaData.programId).shouldMoveAutomatically(true);
    bucket.assign(community, program);
  }

  if (request.purpose === SHOULD_NOT_MOVE_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId);
    const program = createSimpleProgramBuilder(metaData, metaData.programId).shouldMoveAutomatically(false);
    bucket.assign(community, program);
  }

  if (request.purpose === SHOULD_OPEN_COMMUNITY_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId).shouldOpenAutomatically(true);
    bucket.touch(community);
  }


  if (request.purpose === SHOULD_NOT_OPEN_COMMUNITY_AUTOMATICALLY) {
    const metaData = request.metaData;
    const community = createSimpleCommunityBuilder(metaData, metaData.communityId).shouldOpenAutomatically(false);
    bucket.touch(community);
  }
});

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
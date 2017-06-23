import store from 'store'
import NiconamaTabs from '../modules/NiconamaTabs'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.purpose == 'NiconamaTabs.add') {
    NiconamaTabs.add(sender.tab.id, request.id);
  } 

  if (request.purpose == 'NiconamaTabs.remove') {
    NiconamaTabs.remove(sender.tab.id);
  }

  if (request.purpose == 'getFromLocalStorage') {
    sendResponse(store.get(request.key));
    return;
  }

  if (request.purpose == 'saveToLocalStorage') {
    store.set(request.key, request.value);
    return;
  }

  if (request.purpose == 'removeFromLocalStorage') {
    store.remove(request.key);
    return;
  }

  if (request.purpose == 'getFromNestedLocalStorage') {
    let storagedData = {};
    if (store.get(request.key)) {
      storagedData = store.get(request.key);
    }
    sendResponse(storagedData);
  }

  // localStorage->{id->{state, test, ...}, id->{state, test, ...}}
  if (request.purpose == 'saveToNestedLocalStorage') {
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
    return;
  }

  if (request.purpose == 'removeFromNestedLocalStorage') {
    let storagedData = {};
    if (store.get(request.key)) {
      storagedData = store.get(request.key);
    }
    console.info('[nicosapo] Delete storagedData[innerKey] ', storagedData[request.innerKey]);
    delete storagedData[request.innerKey];
    store.set(request.key, storagedData);
    return;
  }
});

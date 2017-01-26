chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.purpose == 'getFromLocalStorage') {
    sendResponse(localStorage.getItem(request.key));
    return;
  }

  if (request.purpose == 'saveToLocalStorage') {
    localStorage.setItem(request.key, request.value);
    return;
  }

  if (request.purpose == 'removeFromLocalStorage') {
    localStorage.removeItem(request.key);
    return;
  }

  if (request.purpose == 'getFromNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
    }
    sendResponse(storagedData);
  }

  // localStorage->{id->{state, test, ...}, id->{state, test, ...}}
  if (request.purpose == 'saveToNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
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
    localStorage.setItem(request.key, JSON.stringify(storagedData));
    return;
  }

  if (request.purpose == 'removeFromNestedLocalStorage') {
    let storagedData = {};
    if (localStorage.getItem(request.key)) {
      storagedData = JSON.parse(localStorage.getItem(request.key));
    }
    console.info('[nicosapo] Delete storagedData[innerKey] ', storagedData[request.innerKey]);
    delete storagedData[request.innerKey];
    localStorage.setItem(request.key, JSON.stringify(storagedData));
    return;
  }
});

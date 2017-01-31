export default class Storage {
  static saveToNestedLocalStorage(key, innerKey, innerValue) {
    console.debug(innerValue);

    chrome.runtime.sendMessage({
        purpose: 'saveToNestedLocalStorage',
        key: key,
        innerKey: innerKey,
        innerValue: innerValue
      },
      (response) => {
        console.info('[nicosapo][saveToNestedLocalStorage] response = ', response);
      });
  }

  static removeFromNestedLocalStorage(key, innerKey) {
    chrome.runtime.sendMessage({
        purpose: 'removeFromNestedLocalStorage',
        key: key,
        innerKey: innerKey
      },
      (response) => {
        console.info('[nicosapo][removeFromNestedLocalStorage] response = ', response);
      });
  }

  static getItem(key) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
          purpose: 'getFromLocalStorage',
          key: key
        },
        (response) => {
          if (response == null) {
            resolve(null);
          } else {
            resolve(JSON.parse(response));
          }
        });
    });
  }
}

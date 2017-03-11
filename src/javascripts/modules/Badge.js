export default class Badge {
  static setText(value) {
    chrome.browserAction.setBadgeText({ text: String(value) });
  }

  static setBackgroundColor(colorCode) {
    chrome.browserAction.setBadgeBackgroundColor({ color: colorCode });
  }
}

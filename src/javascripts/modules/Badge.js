import store from "store";

export default class Badge {
  static setText(value) {
    let text;
    const isHideBadge = store.get("options.hideBadge.enable");
    if (isHideBadge === "enable") {
      if (value == 0) text = "";
      else text = value;
    } else {
      text = value === "" ? 0 : value;
    }
    chrome.browserAction.setBadgeText({ text: String(text) });
  }

  static setBackgroundColor(colorCode) {
    chrome.browserAction.setBadgeBackgroundColor({ color: colorCode });
  }

  static refresh() {
    chrome.browserAction.getBadgeText({}, text => {
      Badge.setText(text);
    });
  }
}

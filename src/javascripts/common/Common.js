export default class Common {
  static enabledOrNull(value) {
    return (value === 'enable') || value == null;
  }

  static wordWrap(text, length) {
    const reg = new RegExp(`(.{${parseInt(length)}})`, `g`);
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
  }

  static sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  static waitUntilCrawlDone() {
    return new Promise((resolve) => {
      const checkFunction = () => {
        chrome.runtime.sendMessage({
            purpose: 'getCrawlState',
          }, (response) => {
          const intervalTime = response || '50';
          console.info('[nicosapo]intervalTime = ', intervalTime);
          setTimeout(checkNewCasts, intervalTime * 1000);
        });
      }
      
    });
  }
}

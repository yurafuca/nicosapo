export default class Common {
  static enabledOrNull(value) {
    if (value == 'enable') {
      return true;
    }
    if (value == null) {
      return true;
    }
    return false;
  }

  static wordWrap(text, length) {
    const reg = new RegExp(`(.{${parseInt(length)}})`, `g`);
    return text.replace(/[\r|\r\n|\n]/g, "").replace(reg, "$1" + "<br>");
  }

  static sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

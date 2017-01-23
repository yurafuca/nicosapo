export default class Common {
  static enabledOrNull(value) {
    return (value === 'enable') || value == null;
  }
}

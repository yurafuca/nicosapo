export default class TimeCounter {
  constructor(date) {
    this.second = date.getSeconds();
    this.minute = date.getMinutes();
    this.hour = date.getHours();
  }

  // Substracter.

  subSecond(second) {
    second = parseInt(second);
    if (this.second <= 0 && this.minute <= 0 && this.hour <= 0) {
      return;
    }
    if (this.second <= 0) {
      this.second = 59;
      this._subMinute(1);
    } else {
      this.second -= parseInt(second);
    }
  }

  _subMinute(minute) {
    minute = parseInt(minute);
    if (this.minute <= 0) {
      this.minute = 59;
      this._subHour(1);
    } else {
      this.minute -= parseInt(minute);
    }
  }

  _subHour(hour) {
    hour = parseInt(hour);
    if (this.hour <= 0) {
      this.hour = 0;
    } else {
      this.hour -= parseInt(hour);
    }
  }

  // Setter.

  setSecond(second) {
    this.second = second;
  }

  setMinute(minute) {
    this.minute = minute;
  }

  setHour(hour) {
    this.hour = hour;
  }

  // Getter.

  getSecond() {
    return this.second;
  }

  getMinute() {
    return this.minute;
  }

  getHour() {
    return this.hour;
  }

  getRemainSec() {
    return this.second + this.minute * 60 + this.hour * 60 * 60;
  }
}

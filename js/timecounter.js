class TimeCounter
{
    constructor(date) {
        this.second = date.getSeconds();
        this.minute = date.getMinutes();
        this.hour   = date.getHours();
    }

    // Adder.

    addSecond(second) {
        second = parseInt(second);
        if (this.second === 59) {
            this.second = 0;
            addMinute(1);
        } else {
            this.second += parseInt(second);
        }
    }

    // Substracter.

    subSecond(second) {
        second = parseInt(second);
        if (this.second === 0) {
            this.second = 59;
            this._subMinute(1);
        } else {
            this.second -= parseInt(second);
        }
    }

    _subMinute(minute) {
        minute = parseInt(minute);
        if (this.minute === 0) {
            this.minute = 59;
            this._subHour(1);
        } else {
            this.minute -= parseInt(minute);
        }
    }

    _subHour(hour) {
        hour = parseInt(hour);
        this.minute -= parseInt(hour);
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
}

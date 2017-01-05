class Time
{
    static toJpnString(milisec)
    {
        const date = new Date(milisec);
        const days = Time.days();

        return [
            date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()
        ].join( '/' ) + ' '
        + '(' + days[date.getDay()] + ') '
        + date.toLocaleTimeString();
    }

    static toJpnDay(milisec)
    {
        const days = Time.days();

        return days[new Date(milisec).getDay()];
    }

    static toUnixTime(milisec)
    {
        const days = Time.days();

        return days[new Date(milisec).getDay()];
    }

    static days()
    {
    	const days = {
            0: '日',
            1: '月',
            2: '火',
            3: '水',
            4: '木',
            5: '金',
            6: '土'
        };

        return days;
    }

    static secondDistance(src, dst)
    {
        console.info(src.getFullYear());
        console.info(dst.getFullYear());
        const deltaMillsecond = dst.getTime() - src.getTime();
        return parseInt(deltaMillsecond / 1000);
    }

    static minuteDistanceOfSec(src, dst)
    {
        const secDist = Time.secondDistance(src, dst);
        return parseInt(secDist % 60);
    }

    static minuteDistance(src, dst)
    {
        const deltaMillsecond = dst.getTime() - src.getTime();
        return parseInt(deltaMillsecond / 1000 / 60);
    }
}

class Time
{
    static toJpnString(milisec)
    {
        const date = new Date(milisec);
        const days = {
            0: '日',
            1: '月',
            2: '火',
            3: '水',
            4: '木',
            5: '金',
            6: '土'
        };
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
    	const days = {
            0: '日',
            1: '月',
            2: '火',
            3: '水',
            4: '木',
            5: '金',
            6: '土'
        };

        return days[new Date(milisec).getDay()];
    }
}


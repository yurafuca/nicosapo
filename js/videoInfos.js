class ArrivalMan
{
    constructor(initial = null) {
        this.source = initial;
    }

    setSource(infos) {
        this.source = infos;
    }

    getArrivals(infos) {
        let newArrives  = $.makeArray();
        let souceTimes  = this.source.find('video start_time').text();

        $.each(infos, function(index, info) {
            let targetTime = info.find('video start_time').text();
            if (!inArray(targetTime, sourceTimes)) {
                newArrives.push(info);
            }
        });

        return newArrives;
    }
}
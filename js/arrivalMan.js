class ArrivalMan
{
    constructor(initial = null) {
        this.source = initial;
    }

    // TODO: validation.
    setSource(infos) {
        this.source = infos;
    }

    getArrivals(infos) {
        if (this.source == null) {
            return infos;
        }

        let newArrives  = $.makeArray();
        let sourceTimes = $.makeArray();

        $.each(this.source, function(index, item) {
            sourceTimes.push($(item).find('video start_time').text());
        });

        $.each(infos, function(index, info) {
            let targetTime = $(info).find('video start_time').text();
            let result = $.inArray(targetTime, sourceTimes);
            if (result === -1) {
                newArrives.push(info);
            }
        });

        return newArrives;
    }
}

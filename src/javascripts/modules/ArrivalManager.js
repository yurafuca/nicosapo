import $ from 'jquery'

export default class ArrivalMan {
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

    const newArrives = $.makeArray();
    const sourceTimes = $.makeArray();

    $.each(this.source, (index, item) => {
      sourceTimes.push($(item).find('video start_time').text());
    });

    $.each(infos, (index, info) => {
      const targetTime = $(info).find('video start_time').text();
      const result = $.inArray(targetTime, sourceTimes);
      if (result === -1) {
        newArrives.push(info);
      }
    });

    return newArrives;
  }
}

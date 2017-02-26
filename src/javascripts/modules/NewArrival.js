import $ from 'jquery'

export default class NewArrival {
  constructor(initial = null) {
    this.source = initial;
  }

  // TODO: validation.
  setSource(infos) {
    this.source = infos;
  }

  /**
   * @param Array infos
   * @return Array newArrives
   * videoInfosを引数にとって新しく始まったと推定される放送のリストを返却する
   */
  get(infos) {
    if (this.source == null) {
      // return infos;
      return [];
    }

    const newArrives = $.makeArray();
    const sourceTimes = $.makeArray();

    $.each(this.source, (index, item) => {
      // 'id'（コミュニティID） ではなく 'open_time_jpstr' でユニーク判定している理由は 'id' ではユニーク判定できない場合があるから．
      // 'id' でユニーク判定できない場合は，放送終了後即座に次の放送が始まった場合．
      // sourceTimes には放送終了前の 'id' が，newArrives には放送終了後の 'id' が入る．
      sourceTimes.push($(item).find('video open_time_jpstr').text());
    });

    $.each(infos, (index, info) => {
      const targetTime = $(info).find('video open_time_jpstr').text();
      const result = $.inArray(targetTime, sourceTimes);
      if (result === -1) {
        newArrives.push(info);
      }
    });

    return newArrives;
  }
}

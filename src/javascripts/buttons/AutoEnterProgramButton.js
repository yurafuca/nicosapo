import $ from 'jquery'
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import Storage from "../modules/Storage";

export default class AutoEnterProgramButton extends Buttons {
  constructor() {
    super();

    this._className = 'auto_enter_program_button';
    this._label = `(この番組に) 自動入場`;

    this._balloonMessage = `この番組が始まったとき自動で番組を新しいタブで開きます．
                                [⚠️負荷軽減のため最大登録数は5を目安にしてください]
                                [💡登録した番組は設定画面より設定できます]`;
    this._balloonPos = 'up';
    this._balloonLength = 'xlarge';

    this._body = this._make();

    // console.info('[nicosapo][AutoEnterProgramButton] this.body = ', this._body);
  }

  // @Override
  _make() {
    this.$template.addClass(this._className);

    this.$balloon.attr('data-balloon-pos', this._balloonPos);
    this.$balloon.attr('data-balloon-length', this._balloonLength);
    this.$balloon.attr('data-balloon', this._balloonMessage);

    // TODO: 別クラスに切り分ける．
    $('#watch_title_box .meta').css('overflow', 'visible');

    return this.$template;
  }

  // @Override
  getClassName() {
    return this.className;
  }

  // @Override
  getDom() {
    return this._body;
  }

  // @Override
  // TODO: スーパークラスに任せる．
  toggleOn() {
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_on');
    $link.removeClass('switch_is_off');
    $link.text(`${this._label}ON`);
  }

  // @Override
  // TODO: スーパークラスに任せる．
  toggleOff() {
    const $link = $($(`.${this._className}`).find('.link'));
    $link.addClass('switch_is_off');
    $link.removeClass('switch_is_on');
    $link.text(`${this._label}OFF`);
  }

  // @Override
  isToggledOn() {
    const $link = $($(`.${this._className}`).find('.link'));
    const isToggledOn = $link.hasClass('switch_is_on');
    return isToggledOn;
  }

  // @Override
  saveAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.liveId; // Required for Both.
    const thumbnail = $('meta[property="og:image"]').attr('content'); // Required for Both.
    const title = $('meta[property="og:title"]').attr('content');  // Required for Both.
    const openDate = $('.kaijo meta[itemprop="datePublished"]').attr("content"); // Required for Live only.
    let owner; // Required for Community only.

    Storage.saveToNestedLocalStorage('autoEnterProgramList', id, {
      state: 'initialized',
      thumbnail: thumbnail,
      title: title,
      openDate: openDate,
      owner: owner
    });
  }

  // @Override
  removeAsAutoEnter() {
    const idHolder = new IdHolder();
    const id = idHolder.liveId;
    Storage.removeFromNestedLocalStorage('autoEnterProgramList', id);
  }
}

import $ from 'jquery'
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";
import Storage from "../modules/Storage";

export default class AutoEnterCommunityButton extends Buttons {
  constructor() {
    super();

    this._className = 'auto_enter_community_button';
    this._label = `(このコミュニティに) 自動入場`;

    this._balloonMessage = `このコミュニティ・チャンネルが放送を始めたとき自動で枠を新しいタブで開きます．
                                [⚠️負荷軽減のため最大登録数は5を目安にしてください]
                                [💡自動次枠移動が ON の状態でも移動先の枠が新しいタブで開かれます]`;
    this._balloonPos = 'up';
    this._balloonLength = 'xlarge';

    this._body = this._make();

    // console.info('[nicosapo][AutoEnterCommunityButton] this.body = ', this._body);
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
    const $link = $('.' + this._className).find('.link');
    $link.addClass('switch_is_on');
    $link.removeClass('switch_is_off');
    $link.text(this._label + 'ON');
  }

  // @Override
  // TODO: スーパークラスに任せる．
  toggleOff() {
    const $link = $('.' + this._className).find('.link');
    $link.addClass('switch_is_off');
    $link.removeClass('switch_is_on');
    $link.text(this._label + 'OFF');
  }

  // @Override
  isToggledOn() {
    const $link = $('.' + this._className).find('.link');
    const isToggledOn = $link.hasClass('switch_is_on');
    return isToggledOn;
  }

  // @Override
  saveAsAutoEnter() {
    let id; // Required for Both.
    let thumbnail; // Required for Both.
    let title; // Required for Both.
    let openDate; // Required for Live only.
    let owner; // Required for Community only.

    thumbnail = $('meta[property="og:image"]').attr('content');

    const idHolder = new IdHolder();

    id = idHolder.communityId;

    const pageType = PageType.get();

    console.info(PageType);

    if (pageType === 'COMMUNITY_PAGE') {
      title = $('div.communityData > h2.title > a').text().replace(/[ ]/, '');
      owner = $('div.communityData tr.row:first-child > td.content > a').text().replace(/[ ]/, '');
    } else if (pageType === 'CHANNEL_PAGE') {
      title = $('h3.cp_chname').text();
      owner = $('p.cp_viewname').text();
    } else if (pageType === 'NORMAL_CAST_PAGE' || pageType === 'OFFICIAL_CAST_PAGE') {
      title = $($('.commu_info').find('a').get(0)).html() || $('.ch_name').html();
      owner = $('.nicopedia_nushi').find('a').text() || $('.company').text();
    } else if (pageType === 'MODERN_CAST_PAGE') {
      title = $('.program-community-name').text();
      owner = $($('.program-broadcaster-name').find('a').get(0)).text()
    }

    console.info(title, owner);

    Storage.saveToNestedLocalStorage('autoEnterCommunityList', id, {
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

    const id = idHolder.communityId;
    const object = {
      id: id,
      status: 'initialized'
    };

    Storage.removeFromNestedLocalStorage('autoEnterCommunityList', id);
  }
}

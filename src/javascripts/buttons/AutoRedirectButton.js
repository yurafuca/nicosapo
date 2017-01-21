import $ from 'jquery'
import Buttons from "../buttons/Buttons"
import IdHolder from "../modules/IdHolder";
import PageType from "../modules/PageType";
import Storage from "../modules/Storage";

export default class AutoRedirectButton extends Buttons
{
    constructor() {
        super();

        this._className = 'auto_redirect_button';
        this._label = `自動次枠移動`;

        this._balloonMessage = `このページを開いたままにしておくと，新しい枠で放送が始まったとき自動で枠へ移動します`;
        this._balloonPos = 'up';
        this._balloonLength = 'xlarge';

        this._body = this._make();

        // console.info('[nicosapo][AutoRedirectButton] this.body = ', this._body);
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
    toggleOn() {
        const $link = $('.' + this._className).find('.link');
        $link.addClass('switch_is_on');
        $link.removeClass('switch_is_off');
        $link.text(this._label + 'ON');
    }

    // @Override
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
        // Do nothing.
    }

    // @Override
    removeAsAutoEnter() {
      // Do nothing.
    }
}

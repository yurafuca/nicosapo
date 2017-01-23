import $ from 'jquery'
import Page from '../page/Page';
import Common from "../common/Common";
import Time from "../common/Time";
import IdHolder from "../modules/IdHolder";
import ExtendedBar from "../modules/ExtendedBar";
import Napi from "../api/Api";

const idHolder = new IdHolder();
const extendedBar = new ExtendedBar();

export default class OfficialCastPage extends Page
{
    putButton() {
        const noSupport = $(`<span>　
                              /* 公式番組では自動枠移動，コミュニティへの自動入場に対応していません */
                              </span>`)
        $('.meta').append(noSupport);
    }

    setUpButton() {
        // Do nothing.
    }

    putExtendedBar() {
        extendedBar.put('#watch_player_top_box');
    }

    setUpExtendedBar(timeCounter) {
        extendedBar.setUp();
    }

    countExtendedBar() {
        extendedBar.countDown();
    }

    updateExtendedBar() {
        extendedBar.update();
    }

    invalidateExtendedBar() {
        extendedBar.invalidate();
    }
}

import $ from 'jquery'
import Page from '../page/Page';
import AutoRedirectButton from "../buttons/AutoRedirectButton";
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import Common from "../common/Common";
import Time from "../common/Time";
import IdHolder from "../modules/IdHolder";
import Napi from "../api/Api";

const idHolder = new IdHolder();
const autoRedirectButton = new AutoRedirectButton();
const autoEnterCommunityButton = new AutoEnterCommunityButton();

export default class ModernCastPage extends Page
{

    static putButton() {
        $('.program-detail div').last().append(autoRedirectButton.getDom());
        $('.program-detail div').last().append(autoEnterCommunityButton.getDom());
    }

    static setUpButton() {
        chrome.runtime.sendMessage({
                purpose: 'getFromLocalStorage',
                key: 'options.autoJump.enable'
            },
            function(response) {
                if (Common.enabledOrNull(response)) {
                    autoRedirectButton.toggleOn();
                } else {
                    autoRedirectButton.toggleOff();
                }
            }
        );
        chrome.runtime.sendMessage({
                purpose: 'getFromNestedLocalStorage',
                key: 'autoEnterCommunityList'
            },
            function(response) {
                if (response[idHolder.communityId]) {
                    autoEnterCommunityButton.toggleOn();
                } else {
                    autoEnterCommunityButton.toggleOff();
                }
            }
        );
    }

    static putExtendedBar() {
        const extendedBar = $(`
            <div id="extended-bar">
                <div class="time end-time"></div>
                <div class="message">延長されていません</div>
                <div class="time rest-time"></div>
            </div>
        `);
        $('#player').after(extendedBar);
        $('#watch_player_top_box').after(extendedBar);
    }

    static setUpExtendedBar(timeCounter) {
        Napi.getStatusByBroadcast(idHolder.liveId).then(function(response) {

            // Extended Bar.
            const currentTime = Date.now();
            const currentDate = new Date(currentTime);

            // new Date() は引数にミリ秒を要求するので 1000 倍するために末尾に '000' を付加する．
            const endTime = Number($(response).find('stream end_time').text() + '000');
            const endDate = new Date(endTime);

            const endTimeJpn = Time.toJpnString(endDate.getTime());

            const restTime_Minute = Time.minuteDistance(currentDate, endDate);
            let   restTime_Second = Time.minuteDistanceOfSec(currentDate, endDate);
                  restTime_Second = ('0' + restTime_Second).slice(-2);

            // タイマーを初期化
            timeCounter.setHour(0);
            timeCounter.setMinute(restTime_Minute);
            timeCounter.setSecond(restTime_Second);

            $('#extended-bar .end-time').text(`${endTimeJpn}`);
            $('#extended-bar .rest-time').text(`${restTime_Minute}：${restTime_Second}`);
        });
    }
}

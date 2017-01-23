import $ from 'jquery'
import Page from '../page/Page';
import AutoEnterCommunityButton from "../buttons/AutoEnterCommunityButton";
import Common from "../common/Common";
import Time from "../common/Time";
import IdHolder from "../modules/IdHolder";

const idHolder = new IdHolder();
const autoEnterCommunityButton = new AutoEnterCommunityButton();

export default class CommunityPage extends Page
{
    putButton() {
        $('a#comSetting_hide').after(autoEnterCommunityButton.getDom());
    }

    setUpButton() {
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
}

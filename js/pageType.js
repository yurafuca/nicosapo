class PageType
{
    static get() {
        let pageType;

        if (this._isModernCast()) {
            pageType = 'MODERN_CAST_PAGE';
        }
        
        else if (this._isStandByPage()) {
            pageType = 'STAND_BY_PAGE';
        }

        else if (this._isGatePage()) {
            pageType = 'GATE_PAGE';
        }

        else if (this._isCommunityPage()) {
            pageType = 'COMMUNITY_PAGE';
        }

        else if (this._isChannelPage()) {
            pageType = 'CHANNEL_PAGE';
        }

        else if (this._isOfficialCastPage()) {
            pageType = 'OFFICIAL_CAST_PAGE';
        }

        else {
            pageType = 'NORMAL_CAST_PAGE';
        }

        console.info('[nicosapo][PageType] pageType = ', pageType);

        return pageType;
    }

    static _isModernCast() {
        const re = /http:\/\/live2\.nicovideo\.jp\/watch\/lv([0-9]+)/;
        const url = window.location.href;

        return url.match(re);
    }

    static _isStandByPage() {
        const flag = ($('#gates').length === 0) && ($('.gate_title').length > 0);

        if (flag) {
            console.info('isStandByPage');
        }

        return flag;
    }

    static _isGatePage() {
        const flag = $('#gates').length > 0;

        if (flag) {
            console.info('isGatePage');
        }

        return flag;
    }

    static _isCommunityPage() {
        const $targetDom = $('table.communityDetail');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    static _isChannelPage() {
        const $targetDom = $('body#channel_top');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    static _isOfficialCastPage() {
        const $targetDom = $('#page.official');
        if ($targetDom.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}

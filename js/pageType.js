class PageType
{
    static get() {
        if (this._isModernCast()) {
            return 'MODERN_CAST_PAGE';
        }

        if (this._isStandByPage()) {
            return 'STAND_BY_PAGE';
        }

        if (this._isGatePage()) {
            return 'GATE_PAGE';
        }

        if (this._isCommunityPage()) {
            return 'COMMUNITY_PAGE';
        }

        if (this._isChannelPage()) {
            return 'CHANNEL_PAGE';
        }

        if (this._isOfficialCastPage()) {
            return 'OFFICIAL_CAST_PAGE';
        }

        return 'NORMAL_CAST_PAGE';
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

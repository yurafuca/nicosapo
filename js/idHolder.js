class IdHolder
{
    constructor() {
        this.liveId = this._getLiveId();
        this.communityId = this._getCommunityId();

        console.info('[imanani][IdHolder] liveId = ', this.liveId);
        console.info('[imanani][IdHolder] communityId = ', this.communityId);
    }

    _getLiveId() {
        const url = $('meta[property="og:url"]').attr('content');
        const re = /http:\/\/live\.nicovideo\.jp\/watch\/lv([0-9]+)/;

        if (re.exec(url)) {
            const liveId = 'lv' + re.exec(url)[1];
            return liveId;
        }

        return undefined;
    }

    _getCommunityId() {
        const communityUrl1 = $('meta[property="og:image"]').attr('content');
        const re1 = /http:\/\/icon\.nimg\.jp\/(community|channel).*((ch|co)[0-9]+)\.jpg.*/;

        // ユーザ放送
        if (re1.exec(communityUrl1)) {
            const communityId = re1.exec(communityUrl1)[2];
            return communityId;
        }

        const communityUrl2 = $('a.ch_name').attr('href');
        const re2 = /http:\/\/(com|ch)\.nicovideo\.jp\/(community|channel)\/([\x21-\x7e]+)/;

        // チャンネル放送/公式放送
        if (re2.exec(communityUrl2)) {
            const communityId = re2.exec(communityUrl2)[3];
            return communityId;
        }

        return undefined;
    }
}

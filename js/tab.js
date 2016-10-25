class BroadcastTab
{
    constructor(tabId, communityId, broadcastId, beginTime, endTime) {
        this._tabId = tabId;
        this._communityId = communityId;
        this.broadcastId = broadcastId;
        this._beginTime = beginTime;
        this._endTime = endTime;
    }

    getTabId() {
        return this._tabId;
    }

    getCommunityId() {
        return this._communityId;
    }

    getBroadcastId() {
        return this._broadcastId;
    }

    getBeginTime() {
        return this._beginTime;
    }

    getEndTime() {
        return this._endTime;
    }

    setTabId(tabId) {
        this._tabId = tabId;
        return this;
    }

    setCommunityId(communityId) {
        this._communityId = communityId;
        return this;
    }

    setBroadcastId(broadcastId) {
        this._broadcastId = broadcastId;
        return this;
    }

    setBeginTime(beginTime) {
        this._beginTime = beginTime;
        return this;
    }

    setEndTime(endTime) {
        this._endTime = endTime;
        return this;
    }

    isEnded() {
        return new Promise(function(resolve, reject) {
            getStatusOfBroadcast(this.broadcastId).then(function(broadCastStatus) {
                console.log('broadCastStatus :' + broadCastStatus);
                if (broadCastStatus == 'ONAIR') {
                    resolve(false);
                }
                if (broadCastStatus == 'ENDED') {
                    resolve(true);
                }
            });
        });
    }

    // getStatusOfBroadcast(broadcastId) {
    //     let date = new Date();
    //     let currentTime = date.getTime();
    //     if (currentTime >= this._endTime) {
    //         return 'ENDED';
    //     }
    //     // api叩く
    //     // if (nicolive.getStatus(broadcastId)) {
    //     //     return 'ENDED';
    //     // }
    //     return 'ONAIR';
    // }

    goToBroadcastPage(broadcastUrl) {
        // chrome.open(broadcastUrl);
    }

    getNewBroadCastUrl() {
        let broadcastUrl = nicolive.getBroadcastUrl();
        if (broadcastUrl == null) {
            return null;
        }
        return broadcastUrl;
    }

    enableAutoRedirect() {

    }

    disableAutoRedirect() {

    }
}

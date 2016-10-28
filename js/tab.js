class BroadcastTab
{
    constructor(tabId, communityId, broadcastId) {
        this._tabId = tabId;
        this._communityId = communityId;
        this._broadcastId = broadcastId;
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

    isEnded() {
        const thisClass = this;
        return new Promise(function(resolve, reject) {
            console.info(thisClass);
            getStatusOfBroadcast(thisClass._broadcastId).then(function(broadCastStatus) {
                console.log('broadCastStatus: ' + broadCastStatus);
                if (broadCastStatus == 'ONAIR') {
                    resolve(false);
                }
                if (broadCastStatus == 'ENDED') {
                    resolve(true);
                }
            });
        });
    }

    redirectBroadcastPage(broadcastId) {
        // chrome.tabs.update(
        //     this._tabId,
        //     {
        //         url: 'http://live.nicovideo.jp/watch/' + broadcastId
        //     }
        // );
		// var code = 'window.location.reload();';
		const endpoint = 'http://live.nicovideo.jp/watch/';
		const broadcastUrl = endpoint + broadcastId;
		const code = 'window.location.replace("' + broadcastUrl + '")';
		chrome.tabs.executeScript(this._tabId, {code: code});
    }

    getNewBroadCastUrl() {
        let broadcastUrl = nicolive.getBroadcastUrl();
        if (broadcastUrl == null) {
            return null;
        }
        return broadcastUrl;
    }

    isEnabledAutoRedirect() {
        const data = sessionStorage[this._communityId];

        if (data == undefined) {
            return true;
        }

        const parsedData = JSON.parse(data);

        if (parsedData.enabledAutoRedirect == 'false')
            return false;
    }
}

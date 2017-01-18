function isLogined() {
    var promise = new Promise((resolve, reject) => {
        var posting = $.post("http://www.nicovideo.jp/api/mylistgroup/list", function(response) {
            var status = $(response).attr('status');
            console.log(status);
            switch (status) {
                case 'ok':
                    resolve(true);
                    break;
                case 'fail':
                    reject(false);
                    break;
            }
        }, 'json');
    });

    return promise;
}

function getSessionId() {

    var promise = new Promise((resolve, reject) => {

        var posting = $.post("http://api.ce.nicovideo.jp/api/v1/session.create", {});

        posting.done(function(data) {

            var status = $(data).find('nicovideo_user_response').attr('status');

            switch (status) {
                case "ok":
                    var sessionId = $(data).find('session').text();
                    console.info('session: ' + sessionId);
                    resolve(sessionId);
                    break;
                case "fail":
                    reject(new Error('Request failed: status is "fail".'));
                    break;
            }
        });
    });

    return promise;
}

// 有料限定∧公式チャンネル の情報が含まれない
function getSubscribe(sessionId) {
    var promise = new Promise((resolve, reject) => {

        var dummy = Math.floor(Math.random() * 1000);
        var request = $.ajax({
            url: "http://api.ce.nicovideo.jp/liveapi/v1/user.subscribe?__context=" + Math.floor(Math.random() * 1000),
            method: "POST",
            dataType: "xml",
            headers: {
                "x-nicovita-session": sessionId
            }
        });

        request.done(function(videoInfos) {
            resolve(videoInfos);
        });

        request.fail(function(jqXHR, textStatus) {
            reject(new Error('Request failed: ' + textStatus));
        });


    });

    return promise;
}

// 有料限定∧公式チャンネル の情報が含まれない
function getSubscribe_2() {
    var promise = new Promise((resolve, reject) => {

        var posting = $.post("http://live.nicovideo.jp/my");

        posting.done(function(response) {
            const htmlContent = $(response);
            const subscribes  = htmlContent.find("[id$=subscribeItemsWrap] > .liveItems > [class^='liveItem']");
            const reserved    = htmlContent.find("[id$=subscribeReservedItemsWrap] > .liveItems > [class^='liveItem']");

            $.each($(reserved), function(index, item) {
                item.is_reserved = true;
            });

            $.merge(subscribes, reserved);

            let videoInfos = [];

            $.each($(subscribes), function(index, item) {

                const video_title = $(item).find('a').first().attr('title');
                const video_url = $(item).find('a').first().attr('href');
                const video_id = video_url.match(/(lv\d+)/g)[0];

                const img = $($(item).find('img')[0]);

                if (img.attr('alt') == 'CLOSED') {
                    return;
                }

                const community_thumbnail_base = img.attr('src').match(/http\:\/\/icon.nimg.jp\/(channel|community)\//)[0];
                const community_id = img.attr('src').match(/(ch|co)\d+/)[0];
                const community_thumbnail = community_thumbnail_base + community_id + '.jpg';

                const video_open_time_jpstr = $(item).find('strong').first().text();

                const videoInfo = $(`
                    <video_info>
                        <video>
                            <id></id>
                            <title></title>
                            <open_time></open_time>
                            <open_time_jpstr></open_time_jpstr>
                            <start_time></start_time>
                            <schedule_end_time/>
                            <end_time></end_time>
                            <provider_type>y</provider_type>
                            <related_channel_id/>
                            <hidescore_online></hidescore_online>
                            <hidescore_comment></hidescore_comment>
                            <community_only></community_only>
                            <channel_only></channel_only>
                            <view_counter></view_counter>
                            <comment_count></comment_count>
                            <is_panorama></is_panorama>
                            <_ts_reserved_count></_ts_reserved_count>
                            <timeshift_enabled></timeshift_enabled>
                            <is_hq></is_hq>
                            <is_reserved></is_reserved>
                        </video>
                        <community>
                            <id></id>
                            <name></name>
                            <channel_id/>
                            <global_id></global_id>
                            <thumbnail></thumbnail>
                            <thumbnail_small></thumbnail_small>
                        </community>
                    </video_info>
                `);

                videoInfo.find('community thumbnail').text(community_thumbnail);
                videoInfo.find('video title').text(video_title);
                videoInfo.find('video id').text(video_id);
                videoInfo.find('video open_time_jpstr').text(video_open_time_jpstr);
                videoInfo.find('community id').text(community_id.replace(/(co|ch)/, ''));

                if (item.is_reserved) {
                    videoInfo.find('video is_reserved').text(true);
                } else {
                    videoInfo.find('video is_reserved').text(false);
                }
                
                videoInfos.push(videoInfo);
            });

            resolve(videoInfos);
        });

    });

    return promise;
}


function getCheckList() {
    var promise = new Promise((resolve, reject) => {

        let endpoint = "http://flapi.nicovideo.jp/api/getchecklist";
        let posting = $.get(endpoint);

        // I dont know why "posting" calls fail(), not done().
        posting.fail(function(data) {

            let text = $.parseJSON(data.responseText);
            var status = text.status;

            switch (status) {
                case "OK":
                    var checkList = text.community_id;
                    resolve($(checkList));
                    break;
                default:
                    reject(new Error('Request failed: status is "fail".'));
                    break;
            }
        });
    });

    return promise;
}

function getFutureOnair(index) {
    var promise = new Promise((resolve, reject) => {

        let endpoint = "http://live.nicovideo.jp/api/getindexzerostreamlist?status=comingsoon&sort=timeshift_reserved_count&zpage=";
        let posting = $.get(endpoint + index);

        posting.done(function(response) {
            const feature_lives = response['reserved_stream_list'];
            if (feature_lives) {
                resolve(feature_lives);
            }
        });
    });

    return promise;
}

function getOfficialOnair() {
    var promise = new Promise((resolve, reject) => {

        let endpoint = "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
        let posting = $.get(endpoint);

        posting.done(function(response) {
            let official_lives = $(response).find('.ranking_video');
            resolve(official_lives);
        });
    });

    return promise;
}

function getStatusByBroadcast(broadcastId) {
    return new Promise((resolve, reject) => {
        getStatus(broadcastId).then(function(response) {
            if (response)
                resolve(response);
            else
                reject();
        });
    });
}

function getStatusByCommunity(communityId) {
    return new Promise((resolve, reject) => {
        getStatus(communityId).then(function(response) {
            if (response) {
				response.communityId = response.param;
				resolve(response);
			} else {
				reject();
			}
        });
    });
}

// TODO: Too ugly!
let parameter_nicovideojs = [];

function getStatus(param) {
		parameter_nicovideojs.push(param);
    return new Promise((resolve, reject) => {
        const endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
        const posting = $.get(endpoint + param);
		const parameter = parameter_nicovideojs.shift();

        posting.done((response) => {
            let status = $(response).find('getplayerstatus').attr('status');
			response.param = parameter;
            resolve(response);
        });
    });
}

function isOffAir(broadcastId) {
    const theBroadcastId = broadcastId;
    return new Promise((resolve, reject) => {
        getStatusByBroadcast(broadcastId).then(function(response) {
            const errorCode = $(response).find('error code').text();

            // OFFAIR or ERROR.
            if (errorCode && (errorCode !== 'require_community_member')) {
                switch (errorCode) {
                    case 'comingsoon':
                        Log.out(theBroadcastId + ' is COMINGSOON', 'isOffAir');
                        response.isOffAir = true;
                        break;
                    case 'premium_only':
                        Log.out(theBroadcastId + ' is PREMIUMONLY', 'isOffAir');
                        response.isOffAir = true;
                        break;
                    case 'closed':
                        Log.out(theBroadcastId + ' is OFFAIR', 'isOffAir');
                        response.isOffAir = true;
                        break;
                    case 'error':
                        Log.out(theBroadcastId + ' is ERROR.', 'isOffAir');
                        reject();
                        return;
                }
            } else {
                // ONAIR.
                response.isOffAir = false;
                const broadcastId = $(response).find('stream id').text();
                Log.out(broadcastId + ' is ONAIR');
            }

            resolve(response);
        });
    });
}

function isStartedBroadcast(communityId) {
    const theCommunityId = communityId;
    return new Promise((resolve, reject) => {
        getStatusByCommunity(theCommunityId).then(function(response) {
            const errorCode = $(response).find('error code').text();
            const result = {
                isStarted: undefined,
                nextBroadcastId: undefined,
                communityId: undefined
            };

            result.communityId = response.communityId;

            // OFFAIR or ERROR.
            if (errorCode) {
                switch (errorCode) {
                    case 'comingsoon':
                        Log.out(result.communityId + ' is STATE==COMINGSOON', 'isStartedBroadcast');
                        resolve(true);
                        return;
                    case 'closed':
                        Log.out(result.communityId + ' is STATE==NOT_READY', 'isStartedBroadcast');
                        result.isStarted = false;
                        resolve(result);
                        return;
                    case 'error':
                        Log.out(result.communityId + ' is STATE==ERROR.', 'isStartedBroadcast');
                        reject();
                        return;
                }
            }

            // OFFAIR or ONAIR.
            const endTime = $(response).find('end_time').text();

            if (Date.now() < (endTime + '000')) {
                Log.out($(response).find('stream id').text() + ' is STATE==OPEN.', 'isStartedBroadcast');
                result.isStarted = true;
                result.nextBroadcastId = $(response).find('stream id').text();
            } else {
                Log.out(result.communityId + ' is STATE==NOT_READY.', 'isStartedBroadcast');
                result.isStarted = false;
            }

            resolve(result);
        });
    });
}

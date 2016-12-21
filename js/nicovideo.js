function isLogined()
{
	var promise = new Promise(function(resolve, reject) {
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
	
	var promise = new Promise(function(resolve, reject) {

		var posting = $.post("http://api.ce.nicovideo.jp/api/v1/session.create",
		{}
		);

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

function getSubscribe(sessionId)
{
	var promise = new Promise(function(resolve, reject) {
		
		var dummy = Math.floor(Math.random () * 1000);
		var request = $.ajax({
			url: "http://api.ce.nicovideo.jp/liveapi/v1/user.subscribe?__context=" + Math.floor(Math.random () * 1000),
			method: "POST",
			dataType: "xml",
			headers: {
				"x-nicovita-session": sessionId
			}
		});

		request.done(function (videoInfos) {
			console.log("cache: " + $(videoInfos).find('total_count').text());
			console.info(videoInfos);
			resolve(videoInfos);
		});

		request.fail(function( jqXHR, textStatus ) {
			reject(new Error('Request failed: ' + textStatus ));
		});


	});

	return promise;
}

function getCheckList()
{
	var promise = new Promise(function(resolve, reject) {

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

function getFutureOnair(index)
{
    console.log(index);

  var promise = new Promise(function(resolve, reject) {

    let endpoint = "http://live.nicovideo.jp/api/getindexzerostreamlist?status=comingsoon&sort=timeshift_reserved_count&zpage=";
    console.log(index);
    let posting = $.get(endpoint + index);

    posting.done(function(response) {
      // const theResponse = $.parseJSON(response);
      // console.info(response);
      const feature_lives = response['reserved_stream_list'];
      if (feature_lives) {
        console.info('[imanani][getOfficialOnair] feature_lives = ', feature_lives);
        resolve(feature_lives);
      }
    });
  });

  return promise;
}

function getOfficialOnair()
{
	var promise = new Promise(function(resolve, reject) {

		let endpoint = "http://live.nicovideo.jp/ranking?type=onair&main_provider_type=official";
		let posting = $.get(endpoint);

		posting.done(function(response) {
			let official_lives = $(response).find('.ranking_video');
			console.info('[imanani][getOfficialOnair] official_lives = ', official_lives);

			resolve(official_lives);
		});
	});

	return promise;
}

function getStatusByBroadcast(broadcastId)
{
  return new Promise(function(resolve, reject) {
    getStatus(broadcastId).then(function(response) {
      if(response)
        resolve(response);
      else
        reject();
    }); 
  });
}

function getStatusByCommunity(communityId)
{
  return new Promise(function(resolve, reject) {
    getStatus(communityId).then(function(response) {
      if(response)
        resolve(response);
      else
        reject();
    }); 
  });
}

function getStatus(param)
{
  return new Promise(function(resolve, reject) {
    const endpoint = "http://watch.live.nicovideo.jp/api/getplayerstatus?v=";
    const posting  = $.get(endpoint + param);

    posting.done(function(response) {
      let status = $(response).find('getplayerstatus').attr('status');
      console.info('[imanani][getStatus] response = ', response);
      resolve(response);
    });
  });
}

function isOffAir(broadcastId)
{
	const theBroadcastId = broadcastId;
  return new Promise(function(resolve, reject) {
    getStatusByBroadcast(broadcastId).then(function(response) {
      const errorCode = $(response).find('error code').text();

      // OFFAIR or ERROR.
      if (errorCode) {
         switch(errorCode) {
         	case 'comingsoon':
             	console.log(theBroadcastId + ' is COMINGSOON');
             	resolve(true);
             	return;
             case 'premium_only':
             	console.log(theBroadcastId + ' is PREMIUMONLY');
             	resolve(true);
             	return;
           	case 'closed':
	             console.log(theBroadcastId + ' is OFFAIR');
	             resolve(true);
	             return;
           case 'error':
	             console.log(theBroadcastId + ' is ERROR.');
	             reject();
	             return;
         }
      }

      // ONAIR
      const broadcastId = $(response).find('stream id').text();
      console.log(broadcastId + ' is ONAIR');
      resolve(false);
    });
  });
}

function isStartedBroadcast(communityId)
{
	const theCommunityId = communityId;
  return new Promise(function(resolve, reject) {
    getStatusByCommunity(communityId).then(function(response) {
      const errorCode = $(response).find('error code').text();
      const result = {
        isStarted: undefined,
        nextBroadcastId: undefined
      };

      // OFFAIR or ERROR.
      if (errorCode) {
         switch(errorCode) {
         	case 'comingsoon':
             	console.log(theCommunityId + ' is COMINGSOON');
             	resolve(true);
             	return;
           case 'closed':
             console.log(theCommunityId + ' is NOT_READY');
             result.isStarted = false;
             resolve(result);
             return;
           case 'error':
             console.log(theCommunityId + ' is ERROR.');
             reject();
             return;
         }
      }

      // OFFAIR or ONAIR.
      const endTime = $(response).find('end_time').text();

      if (Date.now() < (endTime + '000')) {
        console.log($(response).find('stream id').text() + ' is NOW_OPEND.');
        result.isStarted = true;
        result.nextBroadcastId = $(response).find('stream id').text();
      } else {
        console.log('foobar');
        console.log('[imanani][isStartedBroadcast] Date.now = ' + Date.now());
        console.log('[imanani][isStartedBroadcast] endTime = ' + endTime + '000');
        console.log(_communityId + ' is NOT_READY.');
        result.isStarted = false;
      }

      resolve(result);
    });
  });
}

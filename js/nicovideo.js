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

	// Return the promise
	return promise;
}

function getSubscribe(sessionId) {
	// TODO: validate 'sessionId'

	var promise = new Promise(function(resolve, reject) {
		
		var request = $.ajax({
			url: "http://api.ce.nicovideo.jp/liveapi/v1/user.subscribe?__format=xml",
			method: "POST",
			dataType: "xml",
			headers: {
				"x-nicovita-session": sessionId
			}
		});

		request.done(function (videoInfos) {
			console.log(videoInfos);
			resolve(videoInfos);
		});

		request.fail(function( jqXHR, textStatus ) {
			reject(new Error('Request failed: ' + textStatus ));
		});
	});

	// Return the promise
	return promise;
}
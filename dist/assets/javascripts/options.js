/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var bg = chrome.extension.getBackgroundPage();

	var SettingPage = function () {
	    function SettingPage() {
	        // do nothing.

	        _classCallCheck(this, SettingPage);
	    }

	    _createClass(SettingPage, null, [{
	        key: 'getAllSettings',
	        value: function getAllSettings() {
	            var settings = new Object();
	            settings['options.redirect.time'] = $('#options-redirect-time :selected').val();
	            settings['options.popup.enable'] = $('input[name=options-popup-enable]:checked').val();
	            settings['options.showReserved.enable'] = $('input[name=options-showReserved-enable]:checked').val();
	            settings['options.playsound.enable'] = $('input[name=options-playsound-enable]:checked').val();
	            settings['options.soundfile'] = $('#options-soundfile :selected').val();
	            settings['options.playsound.volume'] = $("input[name=options-playsound-volume]").val();
	            settings['options.autoJump.enable'] = $('input[name=options-autoJump-enable]:checked').val();
	            console.info('[imanani][getAllSettings] settings = ', settings);
	            return settings;
	        }
	    }, {
	        key: 'setAllSettings',
	        value: function setAllSettings() {
	            var setting = '';

	            setting = localStorage.getItem('options.redirect.time');
	            if (setting != null) $('#options-redirect-time').val([setting]);

	            setting = localStorage.getItem('options.popup.enable');
	            if (setting != null) $('[name=options-popup-enable]').val([setting]);

	            setting = localStorage.getItem('options.showReserved.enable');
	            if (setting != null) $('[name=options-showReserved-enable]').val([setting]);

	            setting = localStorage.getItem('options.playsound.enable');
	            if (setting != null) $('[name=options-playsound-enable]').val([setting]);

	            setting = localStorage.getItem('options.playsound.volume');
	            if (setting != null) $('[name=options-playsound-volume]').val([setting]);

	            setting = localStorage.getItem('options.soundfile');
	            if (setting != null) $('#options-soundfile').val([setting]);

	            setting = localStorage.getItem('options.autoJump.enable');
	            if (setting != null) $('[name=options-autoJump-enable]').val([setting]);
	        }
	    }]);

	    return SettingPage;
	}();

	var ResultMessage = function () {
	    function ResultMessage() {
	        // do nothing.

	        _classCallCheck(this, ResultMessage);
	    }

	    _createClass(ResultMessage, null, [{
	        key: 'show',
	        value: function show(mode) {
	            var messages = {
	                SAVE: '設定を保存しました．',
	                RESET: '設定をリセットしました．'
	            };
	            $('#console').text(messages[mode]);
	            setTimeout(function () {
	                $('#console').text('');
	            }, 1000);
	        }
	    }]);

	    return ResultMessage;
	}();

	$(function () {
	    SettingPage.setAllSettings();

	    $(document).on('click', '#saveAll', function () {
	        var settings = SettingPage.getAllSettings();
	        for (key in settings) {
	            localStorage.setItem(key, settings[key]);
	        };
	        ResultMessage.show('SAVE');
	    });

	    $("#options-soundfile").change(function () {
	        $("#options-soundfile option:selected").each(function () {
	            new Audio('../sound/' + $(this).val()).play();
	        });
	    });

	    $(document).on('click', '.btn-danger', function () {
	        var id = $(this).attr('data-id');
	        var type = $(this).attr('data-type');
	        var keys = {
	            community: 'autoEnterCommunityList',
	            program: 'autoEnterProgramList'
	        };
	        chrome.runtime.sendMessage({
	            purpose: 'removeFromNestedLocalStorage',
	            key: keys[type],
	            innerKey: id
	        });
	        $(this).closest('.listgroup-item').remove();
	    });

	    $(document).on('click', '.soundtest', function () {
	        var soundfile = $('#options-soundfile :selected').val();
	        var volume = $("input[name=options-playsound-volume]").val();
	        var audio = new Audio('../sound/' + soundfile);
	        audio.volume = volume;
	        audio.play();
	    });

	    chrome.runtime.sendMessage({
	        purpose: 'getFromNestedLocalStorage',
	        key: 'autoEnterProgramList'
	    }, function (response) {
	        console.info('[imanani][getFromNestedLocalStorage] response = ', response);
	        if ($.isEmptyObject(response)) {
	            var subscribe = $('\n                <div class="listgroup-item clearfix">\n                    <span>\u30A2\u30A4\u30C6\u30E0\u304C\u3042\u308A\u307E\u305B\u3093</span>\n                </div>\n            ');
	            $('.listgroup-program').append(subscribe);
	        }
	        // alert((Date.parse(response[id]['openDate'])));
	        for (id in response) {
	            var _subscribe = $('\n                <div class="listgroup-item clearfix">\n                  <div class="nudge-down BtnGroup float-right">\n                    <a href="#" class="btn btn-sm btn-danger BtnGroup-item" rel="facebox">\u524A\u9664</a>\n                  </div>\n                  <div class="list-group-text-block float-left">\n                    <img alt="" class="avatar" height="40" src="" width="40">\n                    <span class="meta-title">\n                      <a href="" target="_blank" class="developer-app-name">title</a>\n                    </span>\n                    <span class="meta-description text-small text-gray">\n                      ---\n                    </span>\n                  </div>\n                </div>\n            ');
	            $(_subscribe).find('.id').text(id);
	            $(_subscribe).find('.developer-app-name').text(response[id]['title']);
	            $(_subscribe).find('.developer-app-name').attr({ href: 'http://live.nicovideo.jp/gate/' + id });
	            $(_subscribe).find('.list-group-text-block img').attr({ src: response[id]['thumbnail'] });
	            $(_subscribe).find('.meta-description').html('openDate: ' + Time.toJpnString(Date.parse(response[id]['openDate'])) + (Date.parse(response[id]['openDate']) < Date.now() ? '<span class="ended"> ⛔ この番組は終了しました</span>' : ''));
	            $(_subscribe).find('.btn-danger').attr('data-id', id);
	            $(_subscribe).find('.btn-danger').attr('data-type', 'program');
	            // $(subscribe).find('.meta-description').html(response[id]['openDate'] + ' · Owned by <a href="' + response[id]['communityId'] + '">' + response[id]['communityName'] + '</a>');
	            $('.listgroup-program').append(_subscribe);
	        }
	    });

	    chrome.runtime.sendMessage({
	        purpose: 'getFromNestedLocalStorage',
	        key: 'autoEnterCommunityList'
	    }, function (response) {
	        console.info('[imanani][getFromNestedLocalStorage] response = ', response);
	        if ($.isEmptyObject(response)) {
	            var subscribe = $('\n                <div class="listgroup-item clearfix">\n                    <span>\u30A2\u30A4\u30C6\u30E0\u304C\u3042\u308A\u307E\u305B\u3093</span>\n                </div>\n            ');
	            $('.listgroup-community').append(subscribe);
	        }
	        // alert((Date.parse(response[id]['openDate'])));
	        for (id in response) {
	            var _subscribe2 = $('\n                <div class="listgroup-item clearfix">\n                  <div class="nudge-down BtnGroup float-right">\n                    <a href="#" class="btn btn-sm btn-danger BtnGroup-item" rel="facebox">\u524A\u9664</a>\n                  </div>\n                  <div class="list-group-text-block float-left">\n                    <img alt="" class="avatar" height="40" src="" width="40">\n                    <span class="meta-title">\n                      <a href="" target="_blank" class="developer-app-name">title</a>\n                    </span>\n                    <span class="meta-description text-small text-gray">\n                      ---\n                    </span>\n                  </div>\n                </div>\n            ');
	            $(_subscribe2).find('.id').text(id);
	            $(_subscribe2).find('.developer-app-name').text(response[id]['title']);
	            $(_subscribe2).find('.developer-app-name').attr({ href: 'http://com.nicovideo.jp/community/' + id });
	            $(_subscribe2).find('.list-group-text-block img').attr({ src: response[id]['thumbnail'] });
	            $(_subscribe2).find('.meta-description').html(response[id]['owner']);
	            $(_subscribe2).find('.btn-danger').attr('data-id', id);
	            $(_subscribe2).find('.btn-danger').attr('data-type', 'community');
	            // $(subscribe).find('.meta-description').html(response[id]['openDate'] + ' · Owned by <a href="' + response[id]['communityId'] + '">' + response[id]['communityName'] + '</a>');
	            $('.listgroup-community').append(_subscribe2);
	        }
	    });
	});

/***/ }
/******/ ]);
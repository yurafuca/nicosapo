import $ from 'jquery'
import React from 'react';
import ReactDOM from 'react-dom';
import Time from './common/Time'
import AutoEnterList from './components/AutoEnterList';

const saveAllSettings = () => {
  const settings = getAllSettings();
  for (const key in settings) {
    localStorage.setItem(key, settings[key]);
  }
}

const getAllSettings = () => {
  const settings = {
    'options.redirect.time':                $('#options-redirect-time :selected').val(),
    'options.popup.enable':                 $('input[name=options-popup-enable]:checked').val(),
    'options.showReserved.enable':          $('input[name=options-showReserved-enable]:checked').val(),
    'options.playsound.enable':             $('input[name=options-playsound-enable]:checked').val(),
    'options.openingNotification.duration': $("input[name=options-openingNotification-duration]").val(),
    'options.soundfile':                    $('#options-soundfile :selected').val(),
    'options.playsound.volume':             $("input[name=options-playsound-volume]").val(),
    'options.autoJump.enable':              $('input[name=options-autoJump-enable]:checked').val(),
    'options.toast.minuteList':             []
  };
  $('input[name=options-toast-minuteList]:checked').map(function() {
    settings['options.toast.minuteList'].push(Number($(this).val()));
  }).get();
  settings['options.toast.minuteList'] = JSON.stringify(settings['options.toast.minuteList']);
  console.info('[nicosapo][getAllSettings] settings = ', settings);
  return settings;
}

const applyAllSettings = () => {
  let setting;
  if (setting = localStorage.getItem('options.redirect.time')) {
    $('#options-redirect-time').val([setting]);
  }
  if (setting = localStorage.getItem('options.popup.enable')) {
    $('[name=options-popup-enable]').val([setting]);
  }
  if (setting = localStorage.getItem('options.showReserved.enable')) {
    $('[name=options-showReserved-enable]').val([setting]);
  }
  if (setting = localStorage.getItem('options.playsound.enable')) {
    $('[name=options-playsound-enable]').val([setting]);
  }
  if (setting = localStorage.getItem('options.openingNotification.duration')) {
    $('[name=options-openingNotification-duration]').val([setting]);
    $('#openingNotification-duration').text([setting]);
  }
  if (setting = localStorage.getItem('options.playsound.volume')) {
    $('[name=options-playsound-volume]').val([setting]);
  }
  if (setting = localStorage.getItem('options.soundfile')) {
    $('#options-soundfile').val([setting]);
  }
  if (setting = localStorage.getItem('options.autoJump.enable')) {
    $('[name=options-autoJump-enable]').val([setting]);
  }
  if (setting = localStorage.getItem('options.toast.minuteList')) {
    $('[name=options-toast-minuteList]').val(JSON.parse(setting));
  }
}

$(() => {
  applyAllSettings();

  ReactDOM.render(
    <AutoEnterList type='community' />,
    document.getElementById('listgroup-community')
  );

  ReactDOM.render(
    <AutoEnterList type='program' />,
    document.getElementById('listgroup-program')
  );

  $(document).on('click', '#saveAll', () => {
    saveAllSettings();
    $('#console').text(`設定を保存しました．`);
    setTimeout(() => { $('#console').text(''); }, 1000);
  });

  $("#options-soundfile").change(() => {
    $("#options-soundfile option:selected").each(() => {
      new Audio(`../sounds/${$(this).val()}`).play();
    });
  });

  $(document).on('click', '.soundtest', () => {
    const soundfile = $('#options-soundfile :selected').val();
    const volume    = $("input[name=options-playsound-volume]").val();
    const audio     = new Audio(`../sounds/${soundfile}`);
    audio.volume    = volume;
    audio.play();
  });

  const selector = "input[name=options-openingNotification-duration]";
  $(selector).on("input", () => {
    $("#openingNotification-duration").text($(selector).val());
  });
});

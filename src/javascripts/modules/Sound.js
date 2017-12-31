import store from "store";

export default class Sound {
  play() {
    this._make().play();
  }

  _make() {
    const soundFile = this._getPath();
    const volume = this._getVolume();
    const audio = new Audio(`sounds/${soundFile}`);
    audio.volume = volume;
    console.info("volume = ", volume);
    return audio;
  }

  _getPath() {
    return store.get("options.soundfile") || "ta-da.mp3";
  }

  _getVolume() {
    return store.get("options.playsound.volume") || 1.0;
  }
}

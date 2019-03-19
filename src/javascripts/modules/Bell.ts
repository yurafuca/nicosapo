export class Bell {
  private _hasRang: boolean;
  private _hasFailed: boolean;
  private _path: string;
  private _volume: number;

  constructor(path: string) {
    this._hasRang = false;
    this._hasFailed = false;
    this._path = path;
    this._volume = 1.0;
  }

  volume(volume: number) {
    this._volume = volume;
    return this;
  }

  ring() {
    const audio = new Audio(`sounds/${this._path}`);
    audio.volume = this._volume;
    audio.play().then(() => {
      this._hasRang = true;
    }).catch(() => {
      this._hasFailed = true;
    })
  }

  hasRang() {
    return this._hasRang;
  }

  hasError() {
    return this._hasFailed;
  }
}

import { Community, Program } from "./Checkable";

export class CheckableBuilder {
  private _id: string;
  private _thumbnailUrl: string | null;
  private _shouldOpenAutomatically: boolean | null;
  private _shouldMoveAutomatically: boolean | null;
  private _isVisiting: boolean | null;
  private _isFollowing: boolean | null;

  constructor() {
    this._shouldOpenAutomatically = false;
    this._isVisiting = false;
  }

  buildCommunity(): Community {
    return new Community(this);
  }

  buildProgram(revision: number): Program {
    return new Program(this, revision);
  }

  id(id: string) {
    this._id = id;
    return this;
  }

  thumbnailUrl(url: string) {
    this._thumbnailUrl = url;
    return this;
  }

  shouldOpenAutomatically(predict: boolean): CheckableBuilder {
    this._shouldOpenAutomatically = predict;
    return this;
  }

  shouldMoveAutomatically(predict: boolean): CheckableBuilder {
    this._shouldMoveAutomatically = predict;
    return this;
  }

  isVisiting(predict: boolean): CheckableBuilder {
    this._isVisiting = predict;
    return this;
  }

  isFollowing(predict: boolean): CheckableBuilder {
    this._isFollowing = predict;
    return this;
  }

  getId(): string {
    return this._id;
  }

  getThumbnailUrl(): string | null {
    return this._thumbnailUrl;
  }

  getShouldOpenAutomatically(): boolean | null {
    return this._shouldOpenAutomatically;
  }

  getShouldMoveAutomatically(): boolean | null {
    return this._shouldMoveAutomatically;
  }

  getIsVisiting(): boolean | null {
    return this._isVisiting;
  }

  getIsFollowing(): boolean | null {
    return this._isFollowing;
  }
}

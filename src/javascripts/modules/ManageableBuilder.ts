import { Community, Program } from "./Manageable";

export class ManageableBuilder {
  private _id: string;
  private _title: string;
  private _shouldOpenAutomatically: boolean | null;

  id(id: string) {
    this._id = id;
    return this;
  }

  title(title: string) {
    this._title = title;
    return this;
  }

  shouldOpenAutomatically(predict: boolean): this {
    this._shouldOpenAutomatically = predict;
    return this;
  }

  getId(): string {
    return this._id;
  }

  getTitle(): string | null {
    return this._title;
  }

  getShouldOpenAutomatically(): boolean | null {
    return this._shouldOpenAutomatically;
  }
}


export class CommunityBuilder extends ManageableBuilder {
  private _thumbnailUrl: string | null;
  private _isFollowing: boolean | null;

  build(): Community {
    return new Community(this);
  }

  thumbnailUrl(url: string) {
    this._thumbnailUrl = url;
    return this;
  }

  isFollowing(predict: boolean): this {
    this._isFollowing = predict;
    return this;
  }

  getThumbnailUrl(): string | null {
    return this._thumbnailUrl;
  }

  getIsFollowing(): boolean | null {
    return this._isFollowing;
  }
}


export class ProgramBuilder extends ManageableBuilder {
  private _shouldMoveAutomatically: boolean | null;
  private _isVisiting: boolean | null;
  private _isVisited: boolean | null;

  build(revision: number): Program {
    return new Program(this, revision);
  }

  shouldMoveAutomatically(predict: boolean): this {
    this._shouldMoveAutomatically = predict;
    return this;
  }

  isVisiting(predict: boolean): this {
    this._isVisiting = predict;
    return this;
  }

  isVisited(predict: boolean): this {
    this._isVisited = predict;
    return this;
  }

  getShouldMoveAutomatically(): boolean | null {
    return this._shouldMoveAutomatically;
  }

  getIsVisiting(): boolean | null {
    return this._isVisiting;
  }

  getIsVisited(): boolean | null {
    return this._isVisited;
  }
}

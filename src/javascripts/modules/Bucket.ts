export class ProgramBuilder {
    private _id: string;
    private _thumbnailUrl: string;
    private _shouldOpenAutomatically: boolean;
    private _shouldMoveAutomatically: boolean;
    private _isVisiting: boolean;
    constructor() {
        this._shouldOpenAutomatically = false;
        this._shouldMoveAutomatically = false;
        this._isVisiting = false;
    }
    buildCommunity(): Community {
        return new Community(this);
    }
    buildProgram(): Program {
        return new Program(this);
    }
    shouldOpenAutomatically(): ProgramBuilder {
        this._shouldOpenAutomatically = true;
        return this;
    }
    shouldMoveAutomatically(): ProgramBuilder {
        this._shouldMoveAutomatically = true;
        return this;
    }
    visiting(): ProgramBuilder {
        this._isVisiting = true;
        return this;
    }
    getId(): string {
        return this._id;
    }
    getThumbnailUrl(): string {
        return this._thumbnailUrl;
    }
    getShouldOpenAutomatically(): boolean {
        return this._shouldOpenAutomatically;
    }
    getShouldMoveAutomatically(): boolean {
        return this._shouldMoveAutomatically;
    }
    getIsVisiting(): boolean {
        return this._isVisiting;
    }
}

class Bundled {
    id: string;
    shouldOpenAutomatically: boolean = true;
    thumbnailUrl: string;
    isVisiting: boolean;
    isJustStarted: boolean;
    isJustFollowed: boolean;
    constructor(builder: ProgramBuilder) {
        this.id = builder.getId();
        this.thumbnailUrl = builder.getThumbnailUrl();
        this.shouldOpenAutomatically = builder.getShouldOpenAutomatically();
        this.isVisiting = builder.getIsVisiting();
        this.isJustFollowed = false;
        this.isJustStarted = false;
    }
    onCheck() {
        this.isJustStarted = false;
    }
    onStart() {
        this.isJustStarted = true;
    }
    onEnd() {
        this.isJustStarted = false;
    }
    onVisit() {
        this.isVisiting = true;
    }
    onLeave() {
        this.isVisiting = false;
    }
}

class Program extends Bundled { }

class Community extends Bundled {
    shouldMoveAutomatically: boolean;
    isJustFollowed: boolean;
    constructor(builder: ProgramBuilder) {
        super(builder);
        this.shouldMoveAutomatically = builder.getShouldMoveAutomatically();
        this.isJustFollowed = false;
    }
    onFollow() {
        this.isJustFollowed = true;
    }
    onCheck() {
        super.onCheck();
        this.isJustFollowed = false;
    }
}

export class Bucket {
    private programs: Community[];
    constructor() {
        this.programs = new Array<Community>();
    }
    public register(program: Community) {
        this.programs.push(program);
    }
    public all() {
        return this.programs;
    }
    public gc() {
        this.programs = this.programs.filter(p => p.isVisiting != false)
    }
}
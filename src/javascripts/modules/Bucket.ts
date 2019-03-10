export class ProgramBuilder {
    private _shouldOpenAutomatically: boolean;
    private _shouldMoveAutomatically: boolean;
    private _isVisiting: boolean;
    constructor() {
        this._shouldOpenAutomatically = false
        this._shouldMoveAutomatically = false;
        this._isVisiting = false;
    }
    build(): Program {
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

class Program {
    shouldOpenAutomatically: boolean;
    shouldMoveAutomatically: boolean;
    isVisiting: boolean;
    isJustFollowed: boolean;
    isJustStarted: boolean;
    constructor(builder: ProgramBuilder) {
        this.shouldOpenAutomatically = builder.getShouldOpenAutomatically();
        this.shouldMoveAutomatically = builder.getShouldMoveAutomatically();
        this.isVisiting = builder.getIsVisiting();
        this.isJustFollowed = false;
        this.isJustStarted = false;
    }
    onFollow() {
        this.isJustFollowed = true;
    }
    onCheck() {
        this.isJustFollowed = false;
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

export class Bucket {
    private programs: Program[];
    constructor() {
        this.programs = new Array<Program>();
    }
    public register(program: Program) {
        this.programs.push(program);
    }
    public all() {
        return this.programs;
    }
    public gc() {
        this.programs = this.programs.filter(p => p.isVisiting != false)
    }
}
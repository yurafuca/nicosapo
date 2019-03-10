import { Bucket, ProgramBuilder } from "../src/javascripts/modules/Bucket"


// describe('hello', () => {
//     it('hello("jest") to be "Hello Jest!!"', () => {
//         const list = bucket.all().filter(p => p.shouldOpenAutomatically);
//         expect(bucket.all().length).toEqual(0)
//     })
// });

describe('builderTest', () => {
    it('plane', () => {
        const builder = new ProgramBuilder();
        const community = builder.buildCommunity();
        expect(community.shouldOpenAutomatically).toEqual(false);
        expect(community.shouldMoveAutomatically).toEqual(false);
        expect(community.isVisiting).toEqual(false);
        expect(community.isJustFollowed).toEqual(false);
        expect(community.isJustStarted).toEqual(false);
    });
    it('shouldOpenAutomatically', () => {
        const builder = new ProgramBuilder();
        const community = builder.shouldOpenAutomatically().buildCommunity();
        expect(community.shouldOpenAutomatically).toEqual(true);
    });
    it('shouldMoveAutomatically', () => {
        const builder = new ProgramBuilder();
        const community = builder.shouldMoveAutomatically().buildCommunity();
        expect(community.shouldMoveAutomatically).toEqual(true);
    });
    it('visiting', () => {
        const builder = new ProgramBuilder();
        const community = builder.visiting().buildCommunity();
        expect(community.isVisiting).toEqual(true);
    });
});

describe('hello', () => {
    const bucket = new Bucket();
    const builder = new ProgramBuilder();
    bucket.register(builder.visiting().buildCommunity());
    bucket.register(builder.visiting().shouldMoveAutomatically().buildCommunity());
    it('...', () => {
        const list = bucket.all().filter(p => p.isVisiting);
        expect(list.length).toEqual(2);
    });
    it('...', () => {
        const list = bucket.all().filter(p => p.shouldMoveAutomatically == true);
        expect(list.length).toEqual(1);
    });
    it('...', () => {
        const list = bucket.all().filter(p => p.shouldOpenAutomatically == true);
        expect(list.length).toEqual(0);
    });
});

describe('hello', () => {
    const bucket = new Bucket();
    const builder = new ProgramBuilder();
    const community1 = builder.visiting().buildCommunity();
    const community2 = builder.visiting().shouldMoveAutomatically().buildCommunity();
    bucket.register(community1);
    bucket.register(community2);
    it('...', () => {
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        community1.onCheck();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        community2.onLeave();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(1);
        community2.onVisit();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        community2.onFollow();
        community1.onFollow();
        community1.onStart();
        community2.onStart();
        expect(bucket.all().filter(p => p.isJustFollowed).length).toEqual(2);
        expect(bucket.all().filter(p => p.isJustStarted).length).toEqual(2);
        community1.onEnd();
        community2.onEnd();
        expect(bucket.all().filter(p => p.isJustStarted).length).toEqual(0);
        community1.onCheck();
        community2.onCheck();
        expect(bucket.all().filter(p => p.isJustFollowed).length).toEqual(0);
    });
});

describe('hello', () => {
    const bucket = new Bucket();
    const builder = new ProgramBuilder();
    const program1 = builder.visiting().buildCommunity();
    const program2 = builder.visiting().shouldMoveAutomatically().buildCommunity();
    bucket.register(program1);
    bucket.register(program2);
    it('...', () => {
        bucket.all().filter(p => p.shouldOpenAutomatically)
    });
});

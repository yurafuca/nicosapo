import { Bucket, CheckableBuilder } from "../src/javascripts/modules/Bucket"


// describe('hello', () => {
//     it('hello("jest") to be "Hello Jest!!"', () => {
//         const list = bucket.all().filter(p => p.shouldOpenAutomatically);
//         expect(bucket.all().length).toEqual(0)
//     })
// });

describe('builderTest', () => {
    it('plane', () => {
        const builder = new CheckableBuilder();
        const community = builder.buildCommunity();
        expect(community.shouldOpenAutomatically).toEqual(false);
        expect(community.shouldMoveAutomatically).toEqual(false);
        expect(community.isVisiting).toEqual(false);
        expect(community.isJustFollowed).toEqual(false);
        expect(community.isJustStarted).toEqual(false);
    });
    it('shouldOpenAutomatically', () => {
        const builder = new CheckableBuilder();
        const community = builder.shouldOpenAutomatically().buildCommunity();
        expect(community.shouldOpenAutomatically).toEqual(true);
    });
    it('shouldMoveAutomatically', () => {
        const builder = new CheckableBuilder();
        const community = builder.shouldMoveAutomatically().buildCommunity();
        expect(community.shouldMoveAutomatically).toEqual(true);
    });
    it('isVisiting', () => {
        const builder = new CheckableBuilder();
        const community = builder.isVisiting().buildCommunity();
        expect(community.isVisiting).toEqual(true);
    });
});

describe('hello', () => {
    const bucket = new Bucket();
    const builder = new CheckableBuilder();
    bucket.notice(builder.isVisiting().buildCommunity());
    bucket.notice(builder.isVisiting().shouldMoveAutomatically().buildCommunity());
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
    const builder = new CheckableBuilder();
    const community1 = builder.isVisiting().buildCommunity();
    const community2 = builder.isVisiting().shouldMoveAutomatically().buildCommunity();
    bucket.notice(community1);
    bucket.notice(community2);
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
    const builder = new CheckableBuilder();
    const program1 = builder.isVisiting().buildCommunity();
    const program2 = builder.isVisiting().shouldMoveAutomatically().buildCommunity();
    bucket.notice(program1);
    bucket.notice(program2);
    it('...', () => {
        bucket.all().filter(p => p.shouldOpenAutomatically)
    });
});

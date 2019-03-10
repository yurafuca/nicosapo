import { Bucket, ProgramBuilder } from "../Bucket"


// describe('hello', () => {
//     it('hello("jest") to be "Hello Jest!!"', () => {
//         const list = bucket.all().filter(p => p.shouldOpenAutomatically);
//         expect(bucket.all().length).toEqual(0)
//     })
// });

describe('builderTest', () => {
    it('plane', () => {
        const builder = new ProgramBuilder();
        const program = builder.build();
        expect(program.shouldOpenAutomatically).toEqual(false);
        expect(program.shouldMoveAutomatically).toEqual(false);
        expect(program.isVisiting).toEqual(false);
        expect(program.isJustFollowed).toEqual(false);
        expect(program.isJustStarted).toEqual(false);
    });
    it('shouldOpenAutomatically', () => {
        const builder = new ProgramBuilder();
        const program = builder.shouldOpenAutomatically().build();
        expect(program.shouldOpenAutomatically).toEqual(true);
    });
    it('shouldMoveAutomatically', () => {
        const builder = new ProgramBuilder();
        const program = builder.shouldMoveAutomatically().build();
        expect(program.shouldMoveAutomatically).toEqual(true);
    });
    it('visiting', () => {
        const builder = new ProgramBuilder();
        const program = builder.visiting().build();
        expect(program.isVisiting).toEqual(true);
    });
});

describe('hello', () => {
    const bucket = new Bucket();
    const builder = new ProgramBuilder();
    bucket.register(builder.visiting().build());
    bucket.register(builder.visiting().shouldMoveAutomatically().build());
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
    const program1 = builder.visiting().build();
    const program2 = builder.visiting().shouldMoveAutomatically().build();
    bucket.register(program1);
    bucket.register(program2);
    it('...', () => {
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        program1.onCheck();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        program2.onLeave();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(1);
        program2.onVisit();
        expect(bucket.all().filter(p => p.isVisiting).length).toEqual(2);
        program2.onFollow();
        program1.onFollow();
        program1.onStart();
        program2.onStart();
        expect(bucket.all().filter(p => p.isJustFollowed).length).toEqual(2);
        expect(bucket.all().filter(p => p.isJustStarted).length).toEqual(2);
        program1.onEnd();
        program2.onEnd();
        expect(bucket.all().filter(p => p.isJustStarted).length).toEqual(0);
        program1.onCheck();
        program2.onCheck();
        expect(bucket.all().filter(p => p.isJustFollowed).length).toEqual(0);
    });
});

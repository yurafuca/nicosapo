import { Bucket } from "../src/javascripts/modules/Bucket";
import { CheckableBuilder } from "../src/javascripts/modules/CheckableBuilder";

let bucket: Bucket;
let revision: number;

let c1: CheckableBuilder;
let c2: CheckableBuilder;
let c2clone: CheckableBuilder;
let p1: CheckableBuilder;
let p2: CheckableBuilder;

beforeEach(() => {
    bucket = new Bucket();
    revision = 0;
    c1 = new CheckableBuilder().id("co1");
    c2 = new CheckableBuilder().id("co2");
    c2clone = new CheckableBuilder().id("co2");
    p1 = new CheckableBuilder().id("lv1");
    p2 = new CheckableBuilder().id("lv2");
});

it('コミュニティを追加できる', () => {
    expect(bucket.programs().length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('コミュニティを追加できる', () => {
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティを取得できる', () => {
    p1.shouldOpenAutomatically(true);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティを取得できる', () => {
    p1.shouldOpenAutomatically(true).isVisiting(true);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(1);
});

it('自動入場が有効な番組と無効な番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(true);
    p2.shouldOpenAutomatically(false);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティ無効なコミュニティを追加したあと mask できる', () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(false);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.touch(c2, p2);
    bucket.mask([c2]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.touch(c2, p2);
    bucket.mask([c2]);
    bucket.takeProgramsShouldOpen(client1);
    bucket.takeProgramsShouldOpen(client2);
    c2.shouldOpenAutomatically(false);
    bucket.touch(c2, null);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.touch(c2, p2);
    bucket.mask([c2]);
    bucket.takeProgramsShouldOpen(client1);
    bucket.takeProgramsShouldOpen(client2);
    c2clone.shouldOpenAutomatically(false);
    bucket.touch(c2, null);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});


it('自動入場が無効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(false);
    c2.shouldOpenAutomatically(false);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が無効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(false);
    c2.shouldOpenAutomatically(false);
    bucket.touch(c1, p1);
    bucket.touch(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

// describe('hello', () => {
//     const bucket = new Bucket();
//     const builder = new CheckableBuilder();
//     bucket.notice(builder.isVisiting().buildCommunity());
//     bucket.notice(builder.isVisiting().shouldOpenAutomatically().buildCommunity());
//     it('...', () => {
//         const list = bucket.all().filter(p => p.isVisiting);
//         expect(list.length).toEqual(2);
//     });
//     it('...', () => {
//         const list = bucket.all().filter(p => p.shouldMoveAutomatically == true);
//         expect(list.length).toEqual(1);
//     });
//     it('...', () => {
//         const list = bucket.all().filter(p => p.shouldOpenAutomatically == true);
//         expect(list.length).toEqual(0);
//     });
// });

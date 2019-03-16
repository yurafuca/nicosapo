import { Bucket } from "../src/javascripts/modules/Bucket";
import { CommunityBuilder, ManageableBuilder, ProgramBuilder } from "../src/javascripts/modules/CheckableBuilder";

let bucket: Bucket;
let revision: number;

let c1: CommunityBuilder;
let c2: CommunityBuilder;
let c3: CommunityBuilder;
let c2clone: CommunityBuilder;
let p1: ProgramBuilder;
let p2: ProgramBuilder;
let p3: ProgramBuilder;

beforeEach(() => {
    bucket = new Bucket();
    revision = 0;
    c1 = new CommunityBuilder().id("co1");
    c2 = new CommunityBuilder().id("co2");
    c3 = new CommunityBuilder().id("co3");
    c2clone = new CommunityBuilder().id("co2");
    p1 = new ProgramBuilder().id("lv1");
    p2 = new ProgramBuilder().id("lv2");
    p3 = new ProgramBuilder().id("lv3");
});

it('コミュニティを追加できる', () => {
    expect(bucket.programs().length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('コミュニティを追加できる', () => {
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティを取得できる', () => {
    p1.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティを取得できる', () => {
    p1.shouldOpenAutomatically(true).isVisiting(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(1);
});

it('自動入場が有効な番組と無効な番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(true);
    p2.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効な番組と無効な番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(true);
    p2.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティを追加したあと mask できる', () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティ無効なコミュニティを追加したあと mask と touch ができる', () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    c1.shouldOpenAutomatically(false);
    bucket.touch(c1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});



it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.assign(c2, p2);
    bucket.mask([c2]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.assign(c2, p2);
    bucket.mask([c2]);
    bucket.takeProgramsShouldOpen(client1);
    bucket.takeProgramsShouldOpen(client2);
    c2.shouldOpenAutomatically(false);
    bucket.touch(c2);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});

it('自動入場が有効なコミュニティと番組を追加したあと mask できる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.assign(c2, p2);
    bucket.mask([c2]);
    bucket.takeProgramsShouldOpen(client1);
    bucket.takeProgramsShouldOpen(client2);
    c2clone.shouldOpenAutomatically(false);
    bucket.touch(c2);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
});


it('自動入場が無効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(false);
    c2.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が無効なコミュニティと番組を追加したあと mask できる', () => {
    p1.shouldOpenAutomatically(false);
    c2.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場として登録されたばかりの番組は自動入場すべき番組ではない', () => {
    c1.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appoint(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場として登録されたばかりの番組は自動入場すべき番組ではないが，番組が開始したときは自動入場する', () => {
    c1.shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appoint(c2, p2);
    bucket.assign(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('assign と appoint を monkey debug してもただしく動く1', () => {
    c1.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appoint(c2, p2);
    bucket.assign(c2, p2);
    bucket.assign(c2, p2);
    bucket.assign(c2, p2);
    bucket.appoint(c2, p2);
    bucket.assign(c1, p1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('assign と appoint を monkey debug してもただしく動く2', () => {
    c1.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.appoint(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appoint(c2, p2);
    bucket.appoint(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('assign と appoint を monkey debug してもただしく動く3', () => {
    bucket.assign(c1, p1);
    bucket.appoint(c2, p2);
    bucket.appoint(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('assign と appoint を monkey debug してもただしく動く4', () => {
    bucket.assign(c1, p1);
    bucket.appoint(c2, p2);
    bucket.appoint(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});


it('すでに存在する番組の revision は更新されない', () => {
    const client = bucket.createClient();
    c1.isFollowing(true);
    c2.isFollowing(true);
    c3.isFollowing(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(3);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(0);
});

it('番組が始まったら通知される', () => {
    const client = bucket.createClient();
    c1.isFollowing(true);
    c2.isFollowing(true);
    c3.isFollowing(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1, c2]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(2);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(1);
});

// appoint -> assign -1
// assign -> appoint 0

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

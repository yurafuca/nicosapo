import { Bucket } from "../src/javascripts/modules/Bucket";
import { CommunityBuilder, ProgramBuilder } from "../src/javascripts/modules/CheckableBuilder";


let bucket: Bucket;
let revision: number;

let c1: CommunityBuilder;
let c2: CommunityBuilder;
let c3: CommunityBuilder;
let c1clone: CommunityBuilder;
let c2clone: CommunityBuilder;
let p1: ProgramBuilder;
let p2: ProgramBuilder;
let p3: ProgramBuilder;
let p1clone: ProgramBuilder;

beforeEach(() => {
    bucket = new Bucket();
    revision = 0;
    c1 = new CommunityBuilder().id("co1");
    c1clone = new CommunityBuilder().id("co1");
    c2 = new CommunityBuilder().id("co2");
    c3 = new CommunityBuilder().id("co3");
    c2clone = new CommunityBuilder().id("co2");
    p1 = new ProgramBuilder().id("lv1");
    p2 = new ProgramBuilder().id("lv2");
    p3 = new ProgramBuilder().id("lv3");
    p1clone = new ProgramBuilder().id("lv1");
});

it('初期状態は空である', () => {
    expect(bucket.programs().length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('コミュニティと番組を追加できる', () => {
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

it('開いている番組は自動入場をキャンセルする', () => {
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

it('自動入場が有効な番組は mask されない', () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('コミュニティを touch するとコミュニティの状態を更新する', () => {
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

it('mask のリストが変わらなければ複数回 mask しても結果は変わらない', () => {
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.mask([c1]);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('take した client は最新の revision を与えられる', () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.assign(c2, p2);
    bucket.mask([c2]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
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

it('assign と appoint を交互に繰り返しても自動入場すべき番組を取得できる', () => {
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

it('assign と appoint を交互に繰り返しても自動入場すべき番組を取得できる 2', () => {
    c1.shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    bucket.appoint(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appoint(c2, p2);
    bucket.appoint(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it('自動入場が有効になっていない番組へは自動入場しない', () => {
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

it('番組を開いたら登録される', () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    expect(bucket.programs().length).toBe(3);
});

it('開いている番組は mask されない', () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(true);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    bucket.mask([c1, c2]);
    expect(bucket.programs().length).toBe(3);
});

it('閉じた番組は mask される', () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(false);
    bucket.assign(c1, p1);
    bucket.assign(c2, p2);
    bucket.assign(c3, p3);
    bucket.mask([c1, c2]);
    expect(bucket.programs().length).toBe(2);
});

it('boolean を true から false に更新できる', () => {
    c1.isFollowing(true).shouldOpenAutomatically(true);
    p1.isVisiting(true).shouldMoveAutomatically(true).shouldOpenAutomatically(true);
    bucket.assign(c1, p1);
    c1.isFollowing(false).shouldOpenAutomatically(false);
    p1.isVisiting(false).shouldMoveAutomatically(false).shouldOpenAutomatically(false);
    bucket.assign(c1, p1);
    expect(bucket.programs().filter(p => p.community.isFollowing).length).toBe(0);
    expect(bucket.programs().filter(p => p.community.shouldOpenAutomatically).length).toBe(0);
    expect(bucket.programs().filter(p => p.isVisiting).length).toBe(0);
    expect(bucket.programs().filter(p => p.shouldMoveAutomatically).length).toBe(0);
    expect(bucket.programs().filter(p => p.shouldOpenAutomatically).length).toBe(0);
});

it('すでに開始したことがある番組の revision は変更できない', () => {
    c1.isFollowing(true);
    bucket.assign(c1, p1);
    bucket.mask([c1]);
    expect(bucket.programs().filter(p => p.revision() == 0).length).toBe(1);
    c1.shouldOpenAutomatically(true);
    bucket.appoint(c1, p1);
    expect(bucket.programs().filter(p => p.revision() == 0).length).toBe(1);
});

it('Builder の初期化されていないフィールドは null である', () => {
  bucket.assign(c1, new ProgramBuilder().id("lv1"));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(0);
  bucket.appoint(c1, new ProgramBuilder().id("lv1").isVisiting(true));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(1);
  bucket.assign(c1, new ProgramBuilder().id("lv1"));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(1);
});

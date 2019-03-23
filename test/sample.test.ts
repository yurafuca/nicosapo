import { Bucket } from "../src/javascripts/modules/Bucket";
import { CommunityBuilder, ProgramBuilder } from "../src/javascripts/modules/ManageableBuilder";

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

it("初期状態は空である", () => {
    expect(bucket.programs().length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("コミュニティと番組を追加できる", () => {
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("自動入場が有効なコミュニティを取得できる", () => {
    p1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("開いている番組は自動入場をキャンセルする", () => {
    p1.shouldOpenAutomatically(true).isVisiting(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(1);
});

it("自動入場が有効な番組と無効な番組を追加したあと mask できる", () => {
    p1.shouldOpenAutomatically(true);
    p2.shouldOpenAutomatically(false);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("自動入場が有効な番組は mask されない", () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1]);
    expect(bucket.programs().length).toBe(2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("コミュニティを touchCommunity するとコミュニティの状態を更新する", () => {
    c1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1]);
    c1.shouldOpenAutomatically(false);
    bucket.touchCommunity(c1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("mask のリストが変わらなければ複数回 mask しても結果は変わらない", () => {
    p1.shouldOpenAutomatically(true);
    c2.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1]);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("take した client は最新の revision を与えられる", () => {
    const client1 = bucket.createClient();
    const client2 = bucket.createClient();
    c2.shouldOpenAutomatically(true);
    bucket.touchBoth(c2, p2);
    bucket.mask([c2]);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
    expect(client1.revision()).toBe(1);
    expect(client2.revision()).toBe(1);
    bucket.touchCommunity(c2);
    expect(bucket.takeProgramsShouldOpen(client1).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(client2).length).toBe(0);
    expect(client1.revision()).toBe(1);
    expect(client2.revision()).toBe(1);
});

it("自動入場が無効なコミュニティと番組を追加したあと mask できる", () => {
    p1.shouldOpenAutomatically(false);
    c2.shouldOpenAutomatically(false);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("自動入場として登録されたばかりの番組は自動入場すべき番組ではない", () => {
    p2.shouldOpenAutomatically(true);
    bucket.appointBoth(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("自動入場として登録されたばかりの番組は自動入場すべき番組ではないが，番組が開始したときは自動入場する", () => {
    c1.shouldOpenAutomatically(false);
    bucket.touchBoth(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appointBoth(c2, p2);
    bucket.touchBoth(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("touchBoth と appointBoth を交互に繰り返しても自動入場すべき番組を取得できる", () => {
    c1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appointBoth(c2, p2);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c2, p2);
    bucket.appointBoth(c2, p2);
    bucket.touchBoth(c1, p1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(2);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("touchBoth と appointBoth を交互に繰り返しても自動入場すべき番組を取得できる 2", () => {
    c1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.appointBoth(c1, p1);
    p2.shouldOpenAutomatically(true);
    bucket.appointBoth(c2, p2);
    bucket.appointBoth(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("自動入場が有効になっていない番組へは自動入場しない", () => {
    bucket.touchBoth(c1, p1);
    bucket.appointBoth(c2, p2);
    bucket.appointBoth(c2, p2);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("すでに存在する番組の revision は更新されない", () => {
    const client = bucket.createClient();
    c1.isFollowing(true);
    c2.isFollowing(true);
    c3.isFollowing(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(3);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(0);
});

it("番組が始まったら通知される", () => {
    const client = bucket.createClient();
    c1.isFollowing(true);
    c2.isFollowing(true);
    c3.isFollowing(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.mask([c1, c2]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(2);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    bucket.mask([c1, c2, c3]);
    expect(bucket.takeProgramsShouldNotify(client).length).toBe(1);
});

it("番組を開いたら登録される", () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    expect(bucket.programs().length).toBe(3);
});

it("開いている番組は mask されない", () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    bucket.mask([c1, c2]);
    expect(bucket.programs().length).toBe(3);
});

it("閉じた番組は mask される", () => {
    c1.isFollowing(true);
    c2.isFollowing(true);
    p3.isVisiting(false);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c2, p2);
    bucket.touchBoth(c3, p3);
    bucket.mask([c1, c2]);
    expect(bucket.programs().length).toBe(2);
});

it("boolean を true から false に更新できる", () => {
    c1.isFollowing(true).shouldOpenAutomatically(true);
    p1.isVisiting(true).shouldMoveAutomatically(true).shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    c1.isFollowing(false).shouldOpenAutomatically(false);
    p1.isVisiting(false).shouldMoveAutomatically(false).shouldOpenAutomatically(false);
    bucket.touchBoth(c1, p1);
    expect(bucket.programs().filter(p => p.community.isFollowing).length).toBe(0);
    expect(bucket.programs().filter(p => p.community.shouldOpenAutomatically).length).toBe(0);
    expect(bucket.programs().filter(p => p.isVisiting).length).toBe(0);
    expect(bucket.programs().filter(p => p.shouldMoveAutomatically).length).toBe(0);
    expect(bucket.programs().filter(p => p.shouldOpenAutomatically).length).toBe(0);
});

it("すでに開始したことがある番組の revision は変更できない", () => {
    c1.isFollowing(true);
    bucket.touchBoth(c1, p1);
    bucket.mask([c1]);
    expect(bucket.programs().filter(p => p.revision() == 1).length).toBe(1);
    c1.shouldOpenAutomatically(true);
    bucket.appointBoth(c1, p1);
    expect(bucket.programs().filter(p => p.revision() == 1).length).toBe(1);
});

it("Builder の初期化されていないフィールドは null である", () => {
  bucket.touchBoth(c1, new ProgramBuilder().id("lv1"));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(0);
  bucket.appointBoth(c1, new ProgramBuilder().id("lv1").isVisiting(true));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(1);
  bucket.touchBoth(c1, new ProgramBuilder().id("lv1"));
  expect(bucket.programs().filter(p => p.isVisiting).length).toBe(1);
});

it("番組に自動入場するとき shouldOpenAutomatically を false にしなければ入場したにもかかわらず入場をキャンセルしたと通知される", () => {
    p1.shouldOpenAutomatically(true);
    p1.isVisiting(true);
    bucket.touchBoth(c1, p1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(1);
});

it("番組に自動入場するとき shouldOpenAutomatically を false にすれば入場をキャンセルしたと通知されない", () => {
    p1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.takeProgramsShouldOpen(bucket.createClient()).forEach(p => p.onAutomaticVisit());
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("親のない番組を登録できる", () => {
    p1.shouldOpenAutomatically(true);
    bucket.appointProgram(p1);
    expect(bucket.communityList().filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
});

it("親のない番組にコミュニティを紐づけると，その番組は親のない番組としては appointBoth できない", () => {
    bucket.appointProgram(p1);
    bucket.touchBoth(c1, p1);
    p1.shouldOpenAutomatically(true);
    bucket.appointProgram(p1);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
});

it("親のない番組にコミュニティを紐づけると，その番組は親のない番組としては touchBoth できない", () => {
    bucket.touchProgram(p1);
    bucket.touchBoth(c1, p1);
    p1.shouldOpenAutomatically(true);
    bucket.touchProgram(p1);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
});

it("親のない番組を複数回 touchBoth しても数が増えない", () => {
    bucket.appointProgram(p1);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
    bucket.appointProgram(p1);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
    bucket.appointProgram(p2);
    expect(bucket.programs().filter(p => p.community.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(2);
});

it("番組数が 1 以上である親のない番組は削除できない", () => {
    bucket.appointProgram(p1);
    bucket.mask([]);
    expect(bucket.communityList().filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
});

it("番組数が 0 である親のない番組は削除できる", () => {
    bucket.appointProgram(p1);
    bucket.touchBoth(c1, p1);
    bucket.mask([]);
    expect(bucket.communityList().filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
});

it("自動入場した番組は放送開始のおしらせが通知されなくなる", () => {
    c1.isFollowing(true);
    p1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.takeProgramsShouldOpen(bucket.createClient()).forEach(p => p.onAutomaticVisit());
    expect(bucket.takeProgramsShouldNotify(bucket.createClient()).length).toBe(0);
});

it("開いている番組からコミュニティを自動入場に登録したとき誤って自動入場しない", () => {
    bucket.touchBoth(c1, p1);
    c1.shouldOpenAutomatically(true);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
    // Open
    p1.isVisiting(true);
    p1.isVisited(true);
    bucket.touchBoth(c1, p1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("一度自動入場した番組には自動入場しない", () => {
    c1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
    bucket.takeProgramsShouldOpen(bucket.createClient()).forEach(p => p.onAutomaticVisit());
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("一度自動入場した番組はタブを閉じても mask されないし自動入場しない", () => {
    c1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    bucket.touchBoth(c1, p1);
    // Visit automatically.
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    bucket.takeProgramsShouldOpen(bucket.createClient()).forEach(p => p.onAutomaticVisit());
    // Leave.
    p1clone.isVisiting(false);
    bucket.touchBoth(c1, p1clone);
    bucket.mask([]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("一度開いた番組はタブを閉じても mask されないし自動入場しない", () => {
    c1.shouldOpenAutomatically(true);
    bucket.touchBoth(c1, p1);
    // Visit manually.
    p1.isVisiting(true);
    p1.isVisited(true);
    bucket.touchBoth(c1, p1);
    // Leave.
    p1.isVisiting(false);
    bucket.touchBoth(c1, p1);
    bucket.mask([]);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("親のない番組を touchBoth できる", () => {
    p1.shouldOpenAutomatically(true);
    bucket.touchProgram(p1);
    expect(bucket.programsShouldPoll().length).toBe(1);
    expect(bucket.communitiesShouldPoll().length).toBe(0);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(1);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("親のない番組を appointBoth できる", () => {
    p1.shouldOpenAutomatically(true);
    bucket.appointProgram(p1);
    expect(bucket.programsShouldPoll().length).toBe(1);
    expect(bucket.takeProgramsShouldOpen(bucket.createClient()).length).toBe(0);
    expect(bucket.takeProgramsShouldCancelOpen(bucket.createClient()).length).toBe(0);
});

it("親のない番組をサムネイルつきで touchBoth できる", () => {
    const thumbnailUrl = "test.jpg";
    bucket.touchProgram(p1, thumbnailUrl);
    expect(bucket.communityList().filter(c => {
        return c.id.startsWith(Bucket.ANONYMOUS_PREFIX) && c.thumbnailUrl == thumbnailUrl;
    }).length).toBe(1);
});

it("親のない番組をサムネイルつきで appointBoth できる", () => {
    const thumbnailUrl = "test.jpg";
    bucket.appointProgram(p1, thumbnailUrl);
    expect(bucket.communityList().filter(c => {
        return c.id.startsWith(Bucket.ANONYMOUS_PREFIX) && c.thumbnailUrl == thumbnailUrl;
    }).length).toBe(1);
});

it("親のない番組として登録された番組に親を touchBoth できる", () => {
    p1.shouldOpenAutomatically(true);
    bucket.touchProgram(p1);
    expect(bucket.communityList().filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
    expect(bucket.communityList().filter(c => !c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    bucket.touchBoth(c1, p1);
    bucket.mask([]);
    expect(bucket.communityList().filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(0);
    expect(bucket.communityList().filter(c => !c.id.startsWith(Bucket.ANONYMOUS_PREFIX)).length).toBe(1);
});
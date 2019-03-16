import { diff } from 'deep-object-diff';
import { Community, Program } from "./Manageable";
import { ProgramBuilder, CommunityBuilder } from "./CheckableBuilder";

class BucketClient {
    private rev: number;
    private readonly token: string;

    constructor(revision: number, token: string) {
        this.rev = revision;
        this.token = token;
    }

    revision(): number {
        return this.rev;
    }

    setRevision(revision: number, token: string) {
        if (token == this.token) {
            this.rev = revision;
        }
    }
}
// 番組を開いた           assign

// 自動入場コミュニティ番組あり   assign / touch
// 自動入場コミュニティ番組なし   touch
// 自動入場番組           appoint
// 自動枠移動            assign

// 更新時              revision 更新

// touch は community の番組に絶対に変化がないことが保証されている場合にのみ許される
// program の touch はない．このモデルは program が必ず community をもつことを前提にするため．

export class Bucket {
    private communities: Community[];
    private revision: number;
    private readonly token: string;

    constructor() {
        this.communities = new Array<Community>();
        this.revision = 0;
        this.token = "@@NICOSAPO";
    }

    // insert
    // 自動入場（コミュニティ）番組がない
    touch(communityBuilder: CommunityBuilder) {
        this.touchCommunity(communityBuilder);
    }

    // insert
    // 自動入場（コミュニティ），番組がある
    // 更新時
    assign(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder) {
        this.touchBoth(communityBuilder, programBuilder, this.revision);
    }

    // insert
    // 自動入場（番組）
    appoint(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder) {
        this.touchBoth(communityBuilder, programBuilder, -1);
    }

    // drop
    mask(communityBuilders: CommunityBuilder[]) {
        const communities = communityBuilders.map(builder => this.touchCommunity(builder));
        const survivors = communities.map(c => c.id);
        this.communities = this.communities.filter(c => {
            return survivors.includes(c.id) ||
            c.shouldOpenAutomatically ||
            c.programs.some(p => p.shouldOpenAutomatically)
        });
        this.revision += 1;
    }

    createClient():  BucketClient {
        return new BucketClient(0, this.token);
    }

    private touchCommunity(communityBuilder: CommunityBuilder): Community {
        const community = this.createCommunity(communityBuilder);
        // Replace.
        this.communities = this.communities.filter(c => c.id != community.id);
        this.communities.push(community);
        return community;
    }

    private touchBoth(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder, revision: number) {
        const community = this.touchCommunity(communityBuilder);
        const program = this.createProgram(programBuilder, community, revision);
        // Attach.
        community.attachProgram(program);
    }

    takeProgramsShouldCancelOpen(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.isVisiting)
          .filter(p =>
            p.shouldOpenAutomatically || p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() >= client.revision());
        client.setRevision(this.revision, this.token);
        return result;
    }

    takeProgramsShouldOpen(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => !p.isVisiting)
          .filter(p =>
            p.shouldOpenAutomatically || p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() >= client.revision());
        client.setRevision(this.revision, this.token);
        return result;
    }

    takeProgramsShouldNotify(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.community.isFollowing)
          .filter(p =>
            !p.shouldOpenAutomatically && !p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() >= client.revision());
        client.setRevision(this.revision, this.token);
        return result;
    }

    programs(): Program[] {
        return this.communities
            .map(c => c.programs)
            .reduce((array, v) => array.concat(v), [])
    }

    private createCommunity(builder: CommunityBuilder): Community {
        const draft = builder.build();
        const previous = this.findCommunity(draft, this.communities);
        const reference = previous || draft;
        // Update.
        builder.title(builder.getTitle() || reference.title);
        builder.thumbnailUrl(builder.getThumbnailUrl() || reference.thumbnailUrl);
        builder.isFollowing(builder.getIsFollowing() || reference.isFollowing);
        const flag = builder.getShouldOpenAutomatically();
        if (flag != null) {
            builder.shouldOpenAutomatically(flag);
        } else {
            builder.shouldOpenAutomatically(reference.shouldOpenAutomatically)
        }
        // Build.
        const community = builder.build();
        // Attach previous programs.
        reference.programs.forEach(p => {
            community.attachProgram(p);
            p.community = community;
        });
        // Print diff.
        Bucket.difference(previous, community);
        return community;
    }

    private createProgram(builder: ProgramBuilder, parent: Community, revision: number): Program {
        const draft = builder.build(revision);
        const previous = this.findProgram(draft, parent);
        const reference = previous || draft;
        // Update.
        builder.isVisiting(builder.getIsVisiting() || reference.isVisiting);
        builder.title(builder.getTitle() || reference.title);
        const shouldOpen = builder.getShouldOpenAutomatically();
        if (shouldOpen != null) {
            builder.shouldOpenAutomatically(shouldOpen);
        } else {
            builder.shouldOpenAutomatically(reference.shouldOpenAutomatically)
        }
        const shouldMove = builder.getShouldMoveAutomatically();
        if (shouldMove != null) {
            builder.shouldMoveAutomatically(shouldMove);
        } else {
            builder.shouldMoveAutomatically(reference.shouldMoveAutomatically)
        }
        // Choose revision.
        let rev: number;
        if (reference.revision() == -1) {
            rev = revision;
        } else {
            rev = reference.revision();
        }
        // Build.
        const program = builder.build(rev);
        program.community = parent;
        // Print diff.
        Bucket.difference(previous, program);
        return program;
    }

    private findCommunity(community: Community, communities: Community[]): Community | null {
        const ids = communities.map(c => c.id).filter(id => id == community.id);
        if (ids.length == 0) {
            return null;
        }
        const id = ids[0];
        return communities.filter(c => c.id == id)[0];
    }

    private findProgram(program: Program, parent: Community): Program | null {
        return parent.programs.filter(p => p.id == program.id)[0];
    }

    private static difference(prev: object | null, next: object) {
        if (prev != null) {
            const difference = diff(prev, next);
            if (!Bucket.isEmpty(difference)) {
                console.log(difference)
            }
        } else {
            console.info(next);
        }
    }

    private static isEmpty(obj: {}): boolean {
        return Object.keys(obj).length === 0 && obj.constructor === Object
    }
}

const bucket = new Bucket();
export default bucket;

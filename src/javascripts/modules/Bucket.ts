import { diff } from 'deep-object-diff';
import { Community, nonNull, Program } from "./Manageable";
import { ProgramBuilder, CommunityBuilder } from "./ManageableBuilder";

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

export class Bucket {
    private communities: Community[];
    private nextRevision: number;
    private readonly token: string;
    static ANONYMOUS_PREFIX = "@@ANONYMOUS";
    private anonymousCount: number;

    constructor() {
        this.communities = new Array<Community>();
        this.nextRevision = 1;
        this.token = "@@NICOSAPO";
        this.anonymousCount = 0;
    }

    touch(communityBuilder: CommunityBuilder) {
        this.touchCommunity(communityBuilder);
    }

    assign(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder) {
        this.touchBoth(communityBuilder, programBuilder, false);
    }

    appoint(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder) {
        this.touchBoth(communityBuilder, programBuilder, true);
    }

    assignOrphan(programBuilder: ProgramBuilder, thumbnail: string | null = null) {
        const program = this.findProgram(programBuilder, this.basicCommunities());
        let community: CommunityBuilder;
        if (program) {
            community = this.communityToBuilder(program.community);
        } else {
            const prefix = this.takeAnonymousPrefix(programBuilder);
            community = new CommunityBuilder().id(prefix);
        }
        if (thumbnail) {
            community.thumbnailUrl(thumbnail);
        }
        this.assign(community, programBuilder);
    }

    appointOrphan(programBuilder: ProgramBuilder, thumbnail: string | null = null) {
        const program = this.findProgram(programBuilder, this.basicCommunities());
        let community: CommunityBuilder;
        if (program) {
            community = this.communityToBuilder(program.community);
        } else {
            const prefix = this.takeAnonymousPrefix(programBuilder);
            community = new CommunityBuilder().id(prefix);
        }
        if (thumbnail) {
            community.thumbnailUrl(thumbnail);
        }
        this.appoint(community, programBuilder);
    }

    mask(communityBuilders: CommunityBuilder[]) {
        const communities = communityBuilders.map(builder => this.touchCommunity(builder));
        const survivors = communities.map(c => c.id);
        this.communities = this.communities.filter(c => {
            return survivors.includes(c.id) ||
                (c.id.startsWith(Bucket.ANONYMOUS_PREFIX) && c.programs.length > 0) ||
                c.shouldOpenAutomatically ||
                c.programs.some(p => p.shouldOpenAutomatically) ||
                c.programs.some(p => p.isVisiting) ||
              c.programs.some(p => p.isVisited)
        });
    }

    createClient():  BucketClient {
        return new BucketClient(0, this.token);
    }

    private takeAnonymousPrefix(programBuilder: ProgramBuilder) {
        const program = this.findProgram(programBuilder, this.anonymousCommunities());
        if (program != null) {
            return program.community.id;
        }
        return Bucket.ANONYMOUS_PREFIX + "@" + this.anonymousCount++;
    }

    private touchCommunity(communityBuilder: CommunityBuilder): Community {
        const community = this.createCommunity(communityBuilder);
        // Replace.
        this.communities = this.communities.filter(c => c.id != community.id);
        this.communities.push(community);
        return community;
    }

    private touchBoth(communityBuilder: CommunityBuilder, programBuilder: ProgramBuilder, isAppoint: boolean) {
        const gracefulProgram = this.findProgram(programBuilder, this.anonymousCommunities());
        if (gracefulProgram != null) {
            gracefulProgram.community.detachProgram(gracefulProgram);
            const builder = this.programToBuilder(gracefulProgram);
            this.touchBoth(communityBuilder, builder, isAppoint);
        }
        const community = this.touchCommunity(communityBuilder);
        const program = this.createProgram(programBuilder, community, isAppoint);
        // Attach.
        community.attachProgram(program);
    }

    takeProgramsShouldCancelOpen(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.isVisiting)
          .filter(p => !p.isVisited)
          .filter(p =>
            p.shouldOpenAutomatically || p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() > client.revision());
        client.setRevision(this.nextRevision - 1, this.token);
        return result;
    }

    takeProgramsShouldOpen(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => !p.isVisiting)
          .filter(p => !p.isVisited)
          .filter(p =>
            p.shouldOpenAutomatically || p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() > client.revision());
        client.setRevision(this.nextRevision - 1, this.token);
        return result;
    }

    takeProgramsShouldNotify(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => !p.isVisiting)
          .filter(p => p.community.isFollowing)
          .filter(p =>
            !p.shouldOpenAutomatically && !p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() != -1 && p.revision() > client.revision());
        client.setRevision(this.nextRevision - 1, this.token);
        return result;
    }

    communitiesShouldPoll(): Community[] {
        return this.communities.filter(c => c.shouldOpenAutomatically);
    }

    programsShouldPoll(): Program[] {
        return this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.shouldOpenAutomatically);
    }

    programs(): Program[] {
        return this.communities
            .map(c => c.programs)
            .reduce((array, v) => array.concat(v), [])
    }

    communityList(): Community[] {
        return this.communities;
    }

    private createCommunity(builder: CommunityBuilder): Community {
        const draft = builder.build();
        const previous = this.findCommunity(draft, this.communities);
        const reference = previous || draft;
        // Update.
        builder.title(builder.getTitle() || reference.title);
        builder.thumbnailUrl(builder.getThumbnailUrl() || reference.thumbnailUrl);
        const isFollowing = builder.getIsFollowing();
        if (isFollowing != null) {
            builder.isFollowing(isFollowing);
        } else {
            builder.isFollowing(reference.isFollowing);
        }
        const shouldOpen = builder.getShouldOpenAutomatically();
        if (shouldOpen != null) {
            builder.shouldOpenAutomatically(shouldOpen);
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

    private createProgram(builder: ProgramBuilder, parent: Community, isAppoint: boolean): Program {
        const draft = builder.build(-100); // => dummy revision.
        const previous = this.findProgram(builder, [parent]);
        const reference = previous || draft;
        // Update.
        builder.title(builder.getTitle() || reference.title);
        const isVisiting = builder.getIsVisiting();
        if (isVisiting != null) {
            builder.isVisiting(isVisiting);
        } else {
            builder.isVisiting(reference.isVisiting);
        }
        const isVisited = nonNull(builder.getIsVisited(), reference.isVisited);
        builder.isVisited(isVisited);
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
        if (previous != null) {
            if (isAppoint) {
                if (previous.revision() == -1) {
                    rev = -1;
                } else {
                    rev = previous.revision();
                }
            } else {
                if (previous.revision() == -1) {
                    rev = this.nextRevision++;
                } else {
                    rev = previous.revision();
                }
            }
        } else {
            if (isAppoint) {
                rev = -1;
            } else {
                rev = this.nextRevision++;
            }
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

    private findProgram(programBuilder: ProgramBuilder, parents: Community[]): Program | null {
        const program = programBuilder.build(-100); // => dummy revision.
        return parents
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.id == program.id)[0];
    }

    private communityToBuilder(community: Community) {
        return new CommunityBuilder()
          .id(community.id)
          .title(community.title)
          .shouldOpenAutomatically(community.shouldOpenAutomatically)
          .thumbnailUrl(community.thumbnailUrl)
          .isFollowing(community.isFollowing)
    }

    private programToBuilder(program: Program) {
        return new ProgramBuilder()
          .id(program.id)
          .title(program.title)
          .isVisiting(program.isVisiting)
          .shouldMoveAutomatically(program.shouldMoveAutomatically)
          .shouldOpenAutomatically(program.shouldOpenAutomatically);
    }

    private anonymousCommunities() {
        return this.communities.filter(c => c.id.startsWith(Bucket.ANONYMOUS_PREFIX));
    }

    private basicCommunities() {
        return this.communities.filter(c => !c.id.startsWith(Bucket.ANONYMOUS_PREFIX));
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

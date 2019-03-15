import {filter} from "rxjs/operators";
import { Community, Program } from "./Checkable";
import { CheckableBuilder } from "./CheckableBuilder";


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
    private revision: number;
    private readonly token: string;

    constructor() {
        this.communities = new Array<Community>();
        this.revision = 0;
        this.token = "@@NICOSAPO";
    }

    touch(communityBuilder: CheckableBuilder, programBuilder: CheckableBuilder | null) {
        const community = this.touchCommunity(communityBuilder);
        if (programBuilder != null) {
            const program = this.createProgram(programBuilder);
            // Is just started?
            const foundProgram = this.findProgram(program);
            if (foundProgram == null) {
                program.isJustStarted = true;
            } else {
                program.isJustStarted = !!(!foundProgram.isJustStarted && program.isJustStarted);
            }
            // Attach.
            community.attachProgram(program);
            program.community = community;
        }
    }

    mask(communityBuilders: CheckableBuilder[]) {
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

    private touchCommunity(communityBuilder: CheckableBuilder): Community {
        const community = this.createCommunity(communityBuilder);
        // Replace.
        this.communities = this.communities.filter(c => c.id != community.id);
        this.communities.push(community);
        return community;
    }

    takeProgramsShouldCancelOpen(client: BucketClient): Program[] {
        const result =  this.communities
          .map(c => c.programs)
          .reduce((array, v) => array.concat(v), [])
          .filter(p => p.isVisiting)
          .filter(p =>
            p.shouldOpenAutomatically || p.community.shouldOpenAutomatically
          )
          .filter(p => p.revision() >= client.revision());
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
            .filter(p => p.revision() >= client.revision());
        client.setRevision(this.revision, this.token);
        return result;
    }

    programs(): Program[] {
        return this.communities
            .map(c => c.programs)
            .reduce((array, v) => array.concat(v), [])
    }

    private createCommunity(builder: CheckableBuilder): Community {
        const draft = builder.buildCommunity();
        const reference = this.findCommunity(draft, this.communities) || draft;
        // Update.
        builder.thumbnailUrl(builder.getThumbnailUrl() || reference.thumbnailUrl);
        builder.isFollowing(builder.getIsVisiting() || reference.isFollowing);
        const flag = builder.getShouldOpenAutomatically();
        if (flag != null) {
            builder.shouldOpenAutomatically(flag);
        } else {
            builder.shouldOpenAutomatically(reference.shouldOpenAutomatically)
        }
        // Build.
        const community = builder.buildCommunity();
        // Attach previous programs.
        reference.programs.forEach(p => community.attachProgram(p));
        return community;
    }

    private createProgram(builder: CheckableBuilder): Program {
        const draft = builder.buildProgram(this.revision);
        const reference = this.findProgram(draft) || draft;
        // Update.
        builder.isVisiting(builder.getIsVisiting() || reference.isVisiting);
        builder.shouldMoveAutomatically(builder.getShouldMoveAutomatically() || reference.shouldMoveAutomatically);
        // Build.
        return builder.buildProgram(this.revision);
    }

    private findCommunity(community: Community, communities: Community[]): Community | null {
        const ids = communities.map(c => c.id).filter(id => id == community.id);
        if (ids.length == 0) {
            return null;
        }
        const id = ids[0];
        return communities.filter(c => c.id == id)[0];
    }

    private findProgram(program: Program): Program | null {
        const programs = this.communities.map(c => c.programs).reduce(v => v);
        return programs.filter(p => p.id == program.id)[0];
    }
}

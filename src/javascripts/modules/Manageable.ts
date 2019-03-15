import { CommunityBuilder, ManageableBuilder, ProgramBuilder } from "./CheckableBuilder";

export class Manageable {
  id: string;
  title: string;
  shouldOpenAutomatically: boolean;

  constructor(builder: ManageableBuilder) {
    this.id = builder.getId();
    this.shouldOpenAutomatically = builder.getShouldOpenAutomatically() || false;
  }
}

export class Program extends Manageable {
  community: Community;
  isVisiting: boolean;
  shouldMoveAutomatically: boolean;
  private isActive: boolean;
  private readonly rev: number;

  constructor(builder: ProgramBuilder, revision: number) {
    super(builder);
    this.isVisiting = builder.getIsVisiting() ||false;
    this.shouldMoveAutomatically = builder.getShouldMoveAutomatically() || false;
    this.isActive = false;
    this.rev = revision;
  }

  revision(): number {
    return this.rev;
  }

  onVisit() {
    this.isVisiting = true;
  }

  onLeave() {
    this.isVisiting = false;
  }
}

export class Community extends Manageable {
  programs: Program[];
  isFollowing: boolean;
  thumbnailUrl: string;

  constructor(builder: CommunityBuilder) {
    super(builder);
    this.programs = [];
    this.thumbnailUrl = builder.getThumbnailUrl() || "";
    this.isFollowing = builder.getIsFollowing() || false;
  }

  attachProgram(program: Program | null) {
    if (program == null) {
      return;
    }
    this.detachProgram(program);
    this.programs.push(program);
  }

  detachProgram(program: Program | null) {
    if (program == null) {
      return;
    }
    this.programs = this.programs.filter(p => p.id !== program.id);
  }
}

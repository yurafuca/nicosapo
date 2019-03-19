import { CommunityBuilder, ManageableBuilder, ProgramBuilder } from "./ManageableBuilder";

export const nonNull = (nullableValue: boolean | null, defaultValue: boolean): boolean => {
  if (nullableValue != null) {
    return nullableValue;
  } else {
    return defaultValue;
  }
};

export class Manageable {
  id: string;
  title: string;
  shouldOpenAutomatically: boolean;

  constructor(builder: ManageableBuilder) {
    this.id = builder.getId();
    this.title = builder.getTitle() || "";
    this.shouldOpenAutomatically = nonNull(builder.getShouldOpenAutomatically(), false)
  }
}

export class Program extends Manageable {
  community: Community;
  isVisiting: boolean;
  shouldMoveAutomatically: boolean;
  isVisited: boolean;
  private readonly rev: number;

  constructor(builder: ProgramBuilder, revision: number) {
    super(builder);
    this.isVisiting = builder.getIsVisiting() || false;
    this.shouldMoveAutomatically = nonNull(builder.getShouldMoveAutomatically(), true);
    this.isVisited = nonNull(builder.getIsVisited(), false);
    this.rev = revision;
  }

  revision(): number {
    return this.rev;
  }

  onAutomaticVisit() {
    this.isVisiting = true;
    this.isVisited = true;
    this.shouldOpenAutomatically = false;
  }
}

export class Community extends Manageable {
  programs: Program[];
  isFollowing: boolean;
  thumbnailUrl: string;

  constructor(builder: CommunityBuilder) {
    super(builder);
    this.programs = [];
    this.thumbnailUrl = builder.getThumbnailUrl() || "../../images/icon.png";
    this.isFollowing = builder.getIsFollowing() || false;
  }

  attachProgram(program: Program) {
    this.detachProgram(program);
    this.programs.push(program);
  }

  detachProgram(program: Program) {
    this.programs = this.programs.filter(p => p.id !== program.id);
  }
}

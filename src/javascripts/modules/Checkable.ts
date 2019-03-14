import { CheckableBuilder } from "./CheckableBuilder";

export class Checkable {
  id: string;
  title: string;
  shouldOpenAutomatically: boolean;

  constructor(builder: CheckableBuilder) {
    this.id = builder.getId();
    this.shouldOpenAutomatically = builder.getShouldOpenAutomatically() || false;
  }
}

export class Program extends Checkable {
  community: Community;
  isVisiting: boolean;
  shouldMoveAutomatically: boolean;
  isJustStarted: boolean;
  private isActive: boolean;
  private readonly rev: number;

  constructor(builder: CheckableBuilder, revision: number) {
    super(builder);
    this.isVisiting = builder.getIsVisiting() ||false;
    this.shouldMoveAutomatically = builder.getShouldMoveAutomatically() || false;
    this.isJustStarted = false;
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

export class Community extends Checkable {
  programs: Program[];
  isFollowing: boolean;
  thumbnailUrl: string;

  constructor(builder: CheckableBuilder) {
    super(builder);
    this.programs = [];
    this.thumbnailUrl = builder.getThumbnailUrl() || "";
    this.isFollowing = builder.getIsFollowing() || false;
  }

  justStartedPrograms(): Program[] {
    return this.programs.filter(p => p.isJustStarted);
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

import { interval, Subject } from 'rxjs';
import {filter} from "rxjs/operators";
import bucket from "./Bucket";
import {Poster} from "./Poster";
import store from "store";
import Api from '../api/Api';
import { CommunityBuilder, ProgramBuilder } from './ManageableBuilder';

const AUTOMATIC_VISITING_KEY = "autoEnterProgramList";

interval(1000 * 30).subscribe(
  _ => {
    const communities = bucket.communitiesShouldPoll();
    communities.forEach((community, i) => {
      const delay = i * 3000;
      setTimeout(() => {
        Api.isOpen(community.id).then(result => {
          if (result.isOpen) {
            // Build Manageable objects.
            const communityBuilder = new CommunityBuilder()
              .id(community.id);
            const programBuilder = new ProgramBuilder()
              .id(result.nextLiveId)
              .title(result.title)
              .isVisiting(false)
              .shouldOpenAutomatically(true);
            // Assign.
            bucket.touchBoth(communityBuilder, programBuilder);
          }
        })
      }, delay);
    });
  }
);

interval(1000).subscribe(
  _ => {
    const programs = bucket.programsShouldPoll();
    programs.forEach(program => {
      const programsShouldOpen = store.get(AUTOMATIC_VISITING_KEY, {});
      const openDate = programsShouldOpen[program.id] && programsShouldOpen[program.id].openDate;
      const isStarted = new Date(openDate) < new Date();
      if (isStarted) {
        const builder = new ProgramBuilder().id(program.id);
        bucket.touchProgram(builder);
      }
    });
  }
);

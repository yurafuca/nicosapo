// import {Subject} from 'rxjs';
// import {filter} from "rxjs/operators";
// import bucket from "./Bucket";
// import {Letter} from "./NoticeLetter";
//
// export const communities = new Subject<Community>();
//
//
//
// communities.pipe(
//     filter(p => !p.isFollowing),
//     filter(p => p.isJustStarted),
//     filter(p => !p.shouldOpenAutomatically)
// ).subscribe(
//     community => {
//         // create tab.
//         // notify.
//     }
// );
//
// communities.pipe(
//     filter(p => p.isFollowing),
//     filter(p => p.isJustStarted),
//     filter(p => !p.shouldOpenAutomatically)
// ).subscribe(
//     community => {
//         const letter = new Letter().setup(community);
//         letter.launch();
//     }
// );
//
// export const programs = new Subject<Program>();
//
// programs.pipe(
//     filter(p => p.community.isFollowing),
//     filter(p => p.isJustStarted),
//     filter(p => !p.shouldOpenAutomatically)
// ).subscribe(
//     program => {
//         // create tab.
//         // notify.
//     }
// );
//

import Api from "../api/Api";

export default class GeneralThumbnails {
  loadCasts(genre, callback) {
    Api.loadCasts(genre).then(programs => {
      callback(programs);
    });
  }
}

import React from "react";
import Api from "../api/Api";

export default class GeneralThumbnails extends React.Component {
  loadCasts(genre, callback) {
    Api.loadCasts(genre).then(programs => {
      callback(programs);
    });
  }
}

import React from "react";
import ReactDOM from "react-dom";
import Widgets from "../components/Widgets";
import MetaData from '../modules/MetaData';

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default class Page extends React.Component {
  constructor(props) {
    super(props);
    console.info(MetaData.get());
  }

  putWidgets(props) {
    const parent = document.querySelector(`[${props.idName4ExBar}]`);
    const child = document.createElement("div");
    child.id = "nicosapo_gadgets";
    insertAfter(child, parent);
    ReactDOM.render(
      <Widgets
        buttonOrder={props.buttonOrder}
        enableARButton={props.enableARButton}
        enableACButton={props.enableACButton}
        enableAPButton={props.enableAPButton}
        enableExBar={props.enableExBar}
        message={props.message}
        position={props.position}
        requireInline={props.requireInline}
        element4Buttons={props.element4Buttons}
      />,
      child
    );
  }
}

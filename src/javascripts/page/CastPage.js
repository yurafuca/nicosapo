import React from 'react';
import ReactDOM from 'react-dom';
import Widgetss from '../components/Widgetss';

let isEnabledAutoRedirect = false;

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

export default class CastPage extends React.Component {
  buildExBar(idName) {
    const beforeChild = document.getElementById(idName);
    const child = document.createElement('div');
    child.id = 'nicosapo_gadgets';
    insertAfter(child, beforeChild);
    ReactDOM.render(<Widgetss />, child);
  }

  recieveNotify(isToggledOn) {
    isEnabledAutoRedirect = isToggledOn;
  }
}

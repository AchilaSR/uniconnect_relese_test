import React from 'react';
import ReactDOM from 'react-dom';

function copyStyles(sourceDoc, targetDoc) {
  Array.from(sourceDoc.styleSheets).forEach(styleSheet => {
    if (styleSheet.cssRules) { // true for inline styles
      const newStyleEl = targetDoc.createElement('style');

      Array.from(styleSheet.cssRules).forEach(cssRule => {
        newStyleEl.appendChild(targetDoc.createTextNode(cssRule.cssText));
      });

      targetDoc.head.appendChild(newStyleEl);
    } else if (styleSheet.href) { // true for stylesheets loaded from a URL
      const newLinkEl = targetDoc.createElement('link');

      newLinkEl.rel = 'stylesheet';
      newLinkEl.href = styleSheet.href;
      targetDoc.head.appendChild(newLinkEl);
    }
  });
}


class PopupWindow extends React.PureComponent {
  constructor(props) {
    super(props);
    this.containerEl = null;
    this.externalWindow = null;
  }

  createWindow() {
    this.externalWindow = window.open('', '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=yes, copyhistory=no, width=800, height=600, left=100, top=100');
    this.containerEl = this.externalWindow.document.createElement('div');
    this.externalWindow.document.body.appendChild(this.containerEl);

    this.externalWindow.document.title = 'Recovery Dialer';
    copyStyles(document, this.externalWindow.document);

    this.externalWindow.addEventListener('beforeunload', () => {
      this.props.closeWindowPortal();
    });
  }

  componentWillMount() {
    if (this.props.enabled) {
      this.createWindow();
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.enabled) {
      if (!this.props.enabled) {
        this.createWindow();
      }
    }
  }

  componentWillUnmount() {
    if (this.externalWindow) {
      this.externalWindow.close();
    }
  }

  render() {
    if (this.containerEl) {
      return <div>
        {this.props.children}
        {ReactDOM.createPortal(<div className='popup'>{this.props.children}</div>, this.containerEl)}
      </div>;
    } else {
      return this.props.children;
    }
  }
}

export default PopupWindow;

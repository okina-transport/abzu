/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
 the European Commission - subsequent versions of the EUPL (the "Licence");
 You may not use this work except in compliance with the Licence.
 You may obtain a copy of the Licence at:

 https://joinup.ec.europa.eu/software/page/eupl

 Unless required by applicable law or agreed to in writing, software
 distributed under the Licence is distributed on an "AS IS" basis,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the Licence for the specific language governing permissions and
 limitations under the Licence. */

import React from 'react';
import '../styles/snap.css';

class ErrorBoundry extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  componentDidCatch(error, errorInfo) {
    const { Raven } = this.props;
    if (Raven) {
      this.setState({ error });
      Raven.captureException(error, { extra: errorInfo });
    }
  }

  render() {

    const { Raven } = this.props;

    if (Raven && this.state.error) {
      return (
        <div
          className="snap"
          onClick={() => Raven.lastEventId() && Raven.showReportDialog()}
        >
          <div>
            <h3>Quelque chose s'est mal passé, veuillez nous excuser pour ce désagrément.</h3>
          </div>
          <p>Nos développeurs ont été informés du problème</p>
          <a href={location.protocol + '//' + location.host}>Retour</a>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

export default ErrorBoundry;

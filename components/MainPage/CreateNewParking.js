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
import IconButton from 'material-ui/IconButton';
import { connect } from 'react-redux';
import { UserActions } from '../../actions/';
const newParkingIcon = require('../../static/icons/new-stop-icon-2x.png');

class CreateNewParking extends React.Component {

  handleOnClick(e) {
    this.props.dispatch(UserActions.toggleIsCreatingNewParking());
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const { headerText, bodyText } = this.props.text;

    return (
      <div
        style={{
          background: '#fefefe',
          border: '1px dotted #191919',
          padding: 5,
        }}
      >
        <div style={{ marginLeft: 10 }}>
          <IconButton
            style={{ float: 'right' }}
            onClick={this.handleOnClick.bind(this)}
            iconClassName="material-icons"
          >
            remove
          </IconButton>
          <h4>
            <img
              style={{
                height: 25,
                width: 'auto',
                marginRight: 10,
                verticalAlign: 'middle',
              }}
              src={newParkingIcon}
            />
            {headerText}
          </h4>
          <span style={{ fontSize: '0.9em' }}>
            {bodyText}
          </span>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isCreatingNewParking: state.user.isCreatingNewParking,
});

export default connect(mapStateToProps)(CreateNewParking);

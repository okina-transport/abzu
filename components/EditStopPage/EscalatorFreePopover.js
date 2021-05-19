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
import MenuItem from 'material-ui/MenuItem';
import { Popover, PopoverAnimationVertical } from 'material-ui/Popover';
import EscalatorFree from '../../static/icons/accessibility/EscalatorFree';
import IconButton from 'material-ui/IconButton';
import accessibilityAssessments from '../../models/accessibilityAssessments';

class EscalatorFreePopover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null,
    };
  }

  handleChange(value) {
    this.setState({
      open: false,
    });
    this.props.handleChange(value);
  }

  handleOpenPopover(event) {
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleClosePopover() {
    this.setState({
      open: false,
    });
  }

  render() {
    const { intl, displayLabel, escalatorFree, disabled } = this.props;
    const { locale } = intl;
    const { open, anchorEl } = this.state;

    return (
      <div>
        <div
          style={{ display: 'flex', alignItems: 'center', fontSize: '0.8em' }}
        >
          <IconButton
            style={{ borderBottom: disabled ? 'none' : '1px dotted grey' }}
            onClick={e => {
              if (!disabled) this.handleOpenPopover(e);
            }}
          >
            <EscalatorFree
              color={accessibilityAssessments.colors[escalatorFree]}
            />
          </IconButton>
          {displayLabel
            ? <div style={{ maginLeft: 5 }}>
                {
                  accessibilityAssessments.EscalatorFreeAccess.values[locale][
                      escalatorFree
                  ]
                }
              </div>
            : ''}
        </div>
        <Popover
          open={open}
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleClosePopover.bind(this)}
          animation={PopoverAnimationVertical}
        >
          {accessibilityAssessments.EscalatorFreeAccess.options.map(
            (option, index) =>
              <MenuItem
                key={'EscalatorFreeAccessItem' + index}
                value={option}
                style={{ padding: '0px 10px' }}
                onClick={() => {
                  this.handleChange(option);
                }}
                primaryText={
                  accessibilityAssessments.EscalatorFreeAccess.values[locale][
                    option
                  ]
                }
                secondaryText={
                  <EscalatorFree
                    style={{
                      float: 'left',
                      marginLeft: -18,
                      marginTop: 9,
                      marginRight: 5,
                      color: accessibilityAssessments.colors[option],
                    }}
                  />
                }
              />,
          )}
        </Popover>
      </div>
    );
  }
}

export default EscalatorFreePopover;

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

import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

class AdvancedReportFilters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      anchorEl: null
    };
  }

  render() {
    const {
      formatMessage,
      withoutLocationOnly,
      withDuplicateImportedIds,
      stopPlacesWithoutQuay,
      stopPlacesWithMultipleProducers,
      quaysWithMultipleProducers,
      nearbyStopPlaces,
      withNearbySimilarDuplicates,
      detectMultiModalPoints,
      withDistantQuays,
      handleCheckboxChange,
      withTags,
      showFutureAndExpired,
      filterByOrg
    } = this.props;

    const { open, anchorEl } = this.state;

    const menuItemsStyle = { display: 'flex', alignItems: 'center' };

    return (
      <div style={{ marginTop: 10, marginLeft: 5 }}>
        <RaisedButton
          onClick={e => {
            this.setState({
              open: true,
              anchorEl: e.currentTarget
            })
          }}
          style={{ transform: 'scale(0.9)' }}
          label={formatMessage({ id: 'filters_more' })}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onRequestClose={() => {
            this.setState({ open: false });
          }}
        >
          <Menu>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'show_future_and_expired' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={showFutureAndExpired}
                onCheck={(e, value) => {
                  handleCheckboxChange('showFutureAndExpired', value);
                }}
              />
            </MenuItem>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'search_with_code' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={filterByOrg}
                onCheck={(e, value) => {
                  handleCheckboxChange('filterByOrg', value);
                }}
              />
            </MenuItem>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'only_without_coordinates' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={withoutLocationOnly}
                onCheck={(e, value) => {
                  handleCheckboxChange('withoutLocationOnly', value);
                }}
              />
            </MenuItem>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'only_duplicate_importedIds' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={withDuplicateImportedIds}
                onCheck={(e, value) => {
                  handleCheckboxChange('withDuplicateImportedIds', value);
                }}
                style={{ marginTop: 10 }}
              />
            </MenuItem>


            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'nearby_stop_places' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={nearbyStopPlaces}
                onCheck={(e, value) => {
                  handleCheckboxChange('nearbyStopPlaces', value);
                }}
                style={{ marginTop: 10 }}
              />
            </MenuItem>


            <MenuItem style={menuItemsStyle}>
              <Checkbox
                  label={formatMessage({ id: 'stop_place_without_quays' })}
                  labelPosition="right"
                  labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                  checked={stopPlacesWithoutQuay}
                  onCheck={(e, value) => {
                    handleCheckboxChange('stopPlacesWithoutQuay', value);
                  }}
                  style={{ marginTop: 10 }}
              />
            </MenuItem>

            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'detect_multi_modal_points' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={detectMultiModalPoints}
                onCheck={(e, value) => {
                  handleCheckboxChange('detectMultiModalPoints', value);
                }}
                style={{ marginTop: 10 }}
              />
            </MenuItem>

            <MenuItem style={menuItemsStyle}>
              <Checkbox
                  label={formatMessage({ id: 'with_distant_quays' })}
                  labelPosition="right"
                  labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                  checked={withDistantQuays}
                  onCheck={(e, value) => {
                    handleCheckboxChange('withDistantQuays', value);
                  }}
                  style={{ marginTop: 10 }}
              />
            </MenuItem>

            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'with_nearby_similar_duplicates' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={withNearbySimilarDuplicates}
                onCheck={(e, value) => {
                  handleCheckboxChange('withNearbySimilarDuplicates', value);
                }}
                style={{ marginTop: 10 }}
              />
            </MenuItem>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'only_with_tags' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={withTags}
                onCheck={(e, value) => {
                  handleCheckboxChange('withTags', value);
                }}
                style={{ marginTop: 10 }}
              />
            </MenuItem>
            <MenuItem style={menuItemsStyle}>
              <Checkbox
                label={formatMessage({ id: 'stop_place_with_multiple_producers' })}
                labelPosition="right"
                labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                checked={stopPlacesWithMultipleProducers}
                onCheck={(e, value) => {
                  handleCheckboxChange('stopPlacesWithMultipleProducers', value);
                }}
                style={{ marginTop: 10 }}
               />
            </MenuItem>
              <MenuItem style={menuItemsStyle}>
                  <Checkbox
                      label={formatMessage({ id: 'quay_with_multiple_producers' })}
                      labelPosition="right"
                      labelStyle={{ width: 'auto', fontSize: '0.9em' }}
                      checked={quaysWithMultipleProducers}
                      onCheck={(e, value) => {
                          handleCheckboxChange('quaysWithMultipleProducers', value);
                      }}
                      style={{ marginTop: 10 }}
                  />
              </MenuItem>
          </Menu>
        </Popover>
      </div>
    );
  }
}

export default AdvancedReportFilters;

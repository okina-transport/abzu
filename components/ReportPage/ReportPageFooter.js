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
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import { getDarkColor } from '../../config/themeConfig';
import dayjs from "dayjs";

const EXPORT_TYPE_STOP_PLACES = 'STOP_PLACES';
const EXPORT_TYPE_QUAYS = 'QUAYS';

// The CSV exports are built by Tiamat, so that they contain all the stop places matching the search, and not only the displayed ones
const getReportCsvExportUrl = () => {
  const tiamatBaseUrl = window.config.tiamatBaseUrl.substring(0, window.config.tiamatBaseUrl.indexOf("graphql"));
  return tiamatBaseUrl + "report/csv";
};

// Tiamat expects the arguments of the stopPlace GraphQL query
const toSearchArguments = queryVariables => {
  const { withDuplicateImportedIds, ...otherVariables } = queryVariables || {};
  return {
    ...otherVariables,
    withDuplicatedQuayImportedIds: withDuplicateImportedIds
  };
};

class ReportPageFooter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isExporting: false
    };
  }

  handleExportOpen(event) {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  downloadCSV(blob, filename) {
    let element = document.createElement('a');
    let dateNow = dayjs().format('DD-MM-YYYY');
    let fullFilename = filename + '-' + dateNow + '.csv';
    let url = URL.createObjectURL(blob);
    element.href = url;
    element.setAttribute('target', '_blank');
    element.setAttribute('download', fullFilename);

    let event = document.createEvent("MouseEvents");
    event.initMouseEvent(
      "click", true, false, window, 0, 0, 0, 0, 0,
      false, false, false, false, 0, null
    );

    element.dispatchEvent(event);
  }

  async exportCSV(type, columnOptions, filename) {
    const { lastQueryVariables } = this.props;
    this.setState({
      open: false,
      isExporting: true
    });
    try {
      const response = await fetch(getReportCsvExportUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem("ABZU::jwt")
        },
        body: JSON.stringify({
          type,
          columns: columnOptions.filter(option => option.checked).map(option => option.id),
          arguments: toSearchArguments(lastQueryVariables)
        })
      });
      if (!response.ok) {
        throw new Error('Report CSV export failed with status ' + response.status);
      }
      this.downloadCSV(await response.blob(), filename);
    } catch (err) {
      console.error('Unable to export the report results as CSV', err);
    } finally {
      this.setState({
        isExporting: false
      });
    }
  }

  handleGetCSVStopPlace() {
    const { stopPlaceColumnOptions } = this.props;
    this.exportCSV(EXPORT_TYPE_STOP_PLACES, stopPlaceColumnOptions, 'results-stop-places');
  }

  handleGetCSVQuays() {
    const { quaysColumnOptions } = this.props;
    let finalColumns = quaysColumnOptions.slice();
    let prependedColumns = ['stopPlaceId', 'stopPlaceName'];

    prependedColumns.forEach( pc => {
      finalColumns.unshift({
        id: pc,
        checked: true
      });
    });

    this.exportCSV(EXPORT_TYPE_QUAYS, finalColumns, 'results-quays');
  }

  render() {
    const { results, activePageIndex, handleSelectPage, intl } = this.props;
    const { formatMessage } = intl;

    const totalCount = results.length;

    const style = {
      width: '100%',
      display: 'flex',
      bottom: 0,
      padding: '10px 0px',
      background: getDarkColor(),
      justifyContent: 'space-between',
      position: 'fixed',
      height: 35,
      zIndex: 100
    };

    const pageWrapperStyle = {
      color: '#fff',
      fontSize: 16,
      display: 'flex',
      alignItems: 'center',
      padding: 10
    };

    const pageItemStyle = {
      fontSize: 14,
      cursor: 'pointer',
      paddingLeft: 5,
      paddingRight: 5
    };

    const activePageStyle = {
      fontWeight: 600,
      borderBottom: '1px solid #41c0c4'
    };

    let pages = [];

    if (totalCount) {
      for (let i = 0; i < Math.ceil(totalCount / 20); i++) {
        pages.push(i);
      }
    }

    return (
      <div style={style}>
        <div style={pageWrapperStyle}>
          <div style={{ marginRight: 10 }}>
            {formatMessage({ id: 'page' })}:
          </div>
          {pages.map(page =>
            <div
              onClick={() => handleSelectPage(page)}
              style={
                activePageIndex === page
                  ? { ...pageItemStyle, ...activePageStyle }
                  : pageItemStyle
              }
              key={'page-' + page}
            >
              {page + 1}
            </div>
          )}
        </div>
        <div style={{ marginRight: 20, display: 'flex' }}>
          <RaisedButton
            onClick={this.handleExportOpen.bind(this)}
            label={formatMessage({ id: this.state.isExporting ? 'loading' : 'export_to_csv' })}
            disabled={!totalCount || this.state.isExporting}
            primary={true}
          />
          <Popover
            open={this.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            onRequestClose={() => {
              this.setState({ open: false });
            }}
          >
            <Menu>
              <MenuItem
                onClick={this.handleGetCSVStopPlace.bind(this)}
                primaryText={formatMessage({ id: 'export_to_csv_stop_places' })}
              />
              <MenuItem
                onClick={this.handleGetCSVQuays.bind(this)}
                primaryText={formatMessage({ id: 'export_to_csv_quays' })}
              />
            </Menu>
          </Popover>
        </div>
      </div>
    );
  }
}

export default ReportPageFooter;

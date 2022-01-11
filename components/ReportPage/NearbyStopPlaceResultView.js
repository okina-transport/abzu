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
import {
  ColumnTransformerStopPlaceJsx,
  ColumnTranslations
} from '../../models/columnTransformers';
import MakeExpandable from '../EditStopPage/MakeExpandable';
import ReportQuayRows from './ReportQuayRows';
import { calculateDistance, calculateEstimate } from '../../modelUtils/leafletUtils';

class NearbyStopPlaceResultView extends React.Component {

  getContainsError(stopPlace) {
    const { duplicateInfo } = this.props;
    if (duplicateInfo.stopPlacesWithConflict) {
      return duplicateInfo.stopPlacesWithConflict.indexOf(stopPlace.id) > -1;
    }
    return false;
  }

  render() {
    const {
      results,
      activePageIndex,
      stopPlaceColumnOptions,
      quaysColumnOptions,
      intl,
      duplicateInfo,
        nearbyRadius
    } = this.props;
    const { locale, formatMessage } = intl;

    const paginatedResults = getResultsPaginationMap(results);
    const resultItems = paginatedResults[activePageIndex] || [];
    const backgroundColorMap = getBackGroundColorMap(resultItems, nearbyRadius);




    const columnStyle = {
      flexBasis: '100%',
      textAlign: 'left',
      marginBottom: 5,
      marginTop: 5,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 12
    };

    const columns = stopPlaceColumnOptions
      .filter(c => c.checked)
      .map(c => c.id);
    const pageSize = results.length <= 20 ? results.length : 20;
    const showingResultLabel = formatMessage({ id: 'showing_results' })
      .replace('$size', pageSize)
      .replace('$total', results.length);

    return (
      <div style={{ paddingBottom: 50 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 10,
            marginTop: -15
          }}
        >
          {showingResultLabel}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            lineHeight: '1.4'
          }}
        >
          <div style={{ display: 'flex', fontWeight: 600, paddingLeft: 10 }}>
            {columns.map((column, i) =>
              <div key={'column-' + column} style={columnStyle}>
                {ColumnTranslations[locale][column]}
              </div>
            )}
            <div key={'column-expand'} style={columnStyle} />
          </div>

          {resultItems.map((item, index) => {

            const containsError = this.getContainsError(item);
            // let background = index % 2 ? 'rgba(213, 228, 236, 0.37)' : '#fff';
              let background = backgroundColorMap.get(index);
            const borderAround = containsError ? '1px solid red' : 'none';

            if (containsError) {
              background = '#ffcfcd';
            }


            return (
              <MakeExpandable
                ownerId={item.id}
                hideToggle={!item.quays.length}
                expandedContent={
                  <ReportQuayRows
                    quays={item.quays}
                    columnOptions={quaysColumnOptions}
                    duplicateInfo={duplicateInfo}
                  />
                }
                key={item.id}
                style={{
                  display: 'flex',
                  background: background,
                  padding: '0px 10px',
                  alignItems: 'center',
                  border: borderAround,
                }}
              >
                {columns.map(column => {
                    return (
                      <div key={'column-item-' + column} style={columnStyle}>
                        {ColumnTransformerStopPlaceJsx[column](item, formatMessage)}
                      </div>
                    );
                  }
                )}
              </MakeExpandable>
            );
          })}
        </div>
      </div>
    );
  }


}

const getResultsPaginationMap = results => {
  if (!results || !results.length) return [];

  let paginationMap = [];
  for (let i = 0, j = results.length; i < j; i += 20) {
    paginationMap.push(results.slice(i, i + 20));
  }
  return paginationMap;
};




const getBackGroundColorMap = (results, nearbyRadius) => {
    if (!results || !results.length) return new Map();

    const firstColor = '#fff';
    const secondColor  = 'rgba(213, 228, 236, 0.37)';

    const backGroundMap = new Map();
    let currentColor;



    for (let i = 0 ; i < results.length; i++) {
        console.log("i:" + i);
        if (i == 0){
            currentColor = firstColor;
        }else{
            const previousLocation = results[i-1].location;
            const currentLocation = results[i].location;
            let previousColor = backGroundMap.get(i-1);
            const latlngCoordinates = [previousLocation, currentLocation];
            const distance= calculateDistance(latlngCoordinates);
            if (distance < nearbyRadius){
                currentColor = previousColor;
            }else{
                if(previousColor === firstColor){
                    currentColor = secondColor;
                }else{
                    currentColor = firstColor;
                }
            }
        }

        backGroundMap.set(i, currentColor);
    }
    return backGroundMap;
};


export default NearbyStopPlaceResultView;

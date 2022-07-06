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
import PropTypes from 'prop-types';
import {Marker, Popup} from 'react-leaflet';
import {divIcon} from 'leaflet';
import ReactDOM from 'react-dom/server';
import CustomMarkerIcon from './CustomMarkerIcon';
import {shallowCompareNeighbourMarker as shallowCompare} from './shallowCompare/';
import {isLegalChildStopPlace} from '../../reducers/rolesReducerUtils';

class NeighbourMarkerParking extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isAllowedToCreateFrom: false
        }
    }

    static propTypes = {
        position: PropTypes.arrayOf(Number),
        handleOnClick: PropTypes.func.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string,
        index: PropTypes.number.isRequired,
        translations: PropTypes.object.isRequired,
        id: PropTypes.string,
        handleHideQuaysForNeighbourStop: PropTypes.func,
        isEditingParking: PropTypes.bool.isRequired,
    };

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.isAllowedToCreateFrom !== nextState.isAllowedToCreateFrom) {
            return true;
        }
        return shallowCompare(this.props, nextProps);
    }

    render() {
        const {
            position,
            handleOnClick,
            index,
            name,
            type,
            id,
            parking,
            tokenParsed
        } = this.props;


        if (!position) return null;

        let divIconBodyMarkup = ReactDOM.renderToStaticMarkup(
            <CustomMarkerIcon
                markerIndex={index}
                type={type}
                secure={parking.secure}
                active={false}
                typeOfParkingRef={parking.typeOfParkingRef}
            />
        );

        let icon = divIcon({
            html: divIconBodyMarkup,
            iconAnchor: [10, 20],
            iconSize: [20, 20],
            popupAnchor: [5, 17]
        });

        let titleStyle = {
            fontWeight: 600,
            color: '#41c0c4',
            fontSize: '1.2em',
            borderBottom: '1px dotted',
            cursor: 'pointer'
        };

        return (
            <Marker
                key={'neighbour-parking' + id}
                keyboard={false}
                icon={icon}
                position={position}
                draggable={false}
            >
                <Popup
                    onOpen={() => {
                        this.setState({
                            isAllowedToCreateFrom: isLegalChildStopPlace(parking, tokenParsed)
                        })
                    }}
                    autoPan={false}
                >
                    <div>
                        <div
                            style={{
                                display: 'inline-block',
                                width: '100%',
                                marginBottom: 15,
                                textAlign: 'center'
                            }}
                            onClick={handleOnClick}
                        >
                            <div style={{display: 'inline-block'}}>
                                <div>
                                    <span style={titleStyle}>{name || id}</span>
                                </div>
                            </div>
                        </div>
                        <div
                            style={{display: 'block', width: 'auto', textAlign: 'center'}}
                        >
              <span style={{display: 'inline-block', textAlign: 'center'}}>
                {position[0]}
              </span>
                            <span style={{display: 'inline-block', marginLeft: 3}}>
                {position[1]}
              </span>
                        </div>
                    </div>
                </Popup>
            </Marker>
        );
    }
}

export default NeighbourMarkerParking;

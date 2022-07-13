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
import SvgIcon from 'material-ui/SvgIcon';
import PropTypes from 'prop-types';
import styles from '../../styles/menu.css'

class ModalityIconSvg extends React.Component {

  shouldComponentUpdate(nextProps) {

    if (nextProps.forceUpdate) {
      return true;
    }

    if (this.props.type === nextProps.type
      && this.props.submode === nextProps.submode) {
      return false;
    }

    return true;
  }

  render() {

    let svgStyle = {
      width: 30,
      height: 25,
      ...this.props.svgStyle,
    };

    const iconStyle = this.props.iconStyle || {
        float: 'left',
        transform: 'translateY(2px)',
      };

    const iconId = getIconIdByTypeOrSubmode(this.props.submode, this.props.type, this.props.secure, this.props.typeOfParkingRef);

    let style = {
      ...(this.props.style || {}),
    };

    return (
      <span className={styles.clear} style={iconStyle}>
        <SvgIcon style={{ ...style, ...svgStyle }}>
          <use
            xlinkHref={`${config.endpointBase}static/icons/svg-sprite.svg#icon-icon_${iconId}`}
          />
        </SvgIcon>
      </span>
    );
  }
}

ModalityIconSvg.propTypes = {
  type: PropTypes.string.isRequired,
  submode: PropTypes.string,
  iconStyle: PropTypes.object,
  style: PropTypes.object,
  forceUpdate: PropTypes.bool
};


const getIconIdByTypeOrSubmode = (submode, type, secure, typeOfParkingRef) => {

  const submodeMap = {
    railReplacementBus: 'railReplacement',
  };
  return submodeMap[submode] || getIconIdByModality(type, secure, typeOfParkingRef);
};

const getIconIdByModality = (type, secure, typeOfParkingRef) => {

  if (type === 'other' && secure){
    return 'bikeDeposit';
  }

  if (type === 'other' && typeOfParkingRef !== null && typeOfParkingRef === 'IndividualBox'){
    return 'bikeRentalSvg';
  }


  const modalityMap = {
    onstreetBus: 'bus-withoutBox',
    onstreetTram: 'tram-withoutBox',
    railStation: 'rail-withoutBox',
    metroStation: 'subway-withoutBox',
    busStation: 'busstation-withoutBox',
    ferryStop: 'ferry-withoutBox',
    airport: 'airplane-withoutBox',
    harbourPort: 'harbour_port',
    liftStation: 'lift',
    other: 'other',
    parkAndRide: 'parking',
    bikeParking: 'parking',
    urbanParking: 'parking',
    airportParking: 'parking',
    trainStationParking: 'parking',
    exhibitionCentreParking: 'parking',
    rentalCarParking: 'parking',
    shoppingCentreParking: 'parking',
    motorwayParking: 'parking',
    roadside: 'parking',
    parkingZone: 'parking',
    undefined: 'parking',
    cycleRental: 'bikeRentalSvg',
  };
  return modalityMap[type] || 'no-information';
};

export default ModalityIconSvg;
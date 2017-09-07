import React from 'react';
import SvgIcon from 'material-ui/SvgIcon';
import PropTypes from 'prop-types';
import styles from '../../styles/menu.css'

class ModalityIcon extends React.Component {

  shouldComponentUpdate(nextProps) {

    if (nextProps.forceUpdate) {
      return true;
    }

    if (this.props.type === nextProps.type
        && this.props.submode === nextProps.submode) {
      return false
    }

    return true
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

    const iconId = getIconIdByTypeOrSubmode(this.props.submode, this.props.type);

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

ModalityIcon.propTypes = {
  type: PropTypes.string.isRequired,
  submode: PropTypes.string,
  iconStyle: PropTypes.object,
  style: PropTypes.object,
  forceUpdate: PropTypes.bool
};


const getIconIdByTypeOrSubmode = (submode, type) => {
  const submodeMap = {
    railReplacementBus: 'railReplacement',
  };
  return submodeMap[submode] || getIconIdByModality(type);
}

const getIconIdByModality = type => {
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
    other: 'no-information',
  };
  return modalityMap[type] || 'no-information';
};

export default ModalityIcon;

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Marker, Popup } from 'react-leaflet'
import L, { divIcon } from 'leaflet'
import stopIcon from "../static/icons/stop-icon-2x.svg"
import ModalityIcon from './ModalityIcon'
import ReactDOM from 'react-dom/server'

class CustomPopupMarker extends React.Component {

  /* avoid rerendering markers if significant information to
     the marker in question has been changed */
  shouldComponentUpdate(nextProps, nextState) {

    if (this.props.markerIndex == '0--1' || this.props.markerIndex  == 0) {

        if (JSON.stringify(this.props.position) !== JSON.stringify(nextProps.position)) {
          return true
        }
        if (this.props.stopType !== nextProps.stopType) {
          return true
        }
        if (this.props.children !== nextProps.children) {
          return true
        }
      }
    return false
  }

  render() {

    let { children, position, handleOnClick,
          handleDragEnd, isQuay, markerIndex, draggable,
          changeCoordinates, text, active, stopType  } = this.props

    if (!children && !children.length) {
      children = text.untitled
    }

    console.warn("position", position)

    const editCoordsStyle = {
      display: 'block',
      borderBottom: '1px dotted black',
      cursor: 'pointer'
    }

    const style = !isQuay ? {
      color: '#0086b3',
      cursor: "pointer",
    } : { color: '#00cc00' }


    let divIconBody = (
      <SuperIcon
        markerIndex={markerIndex}
        isQuay={isQuay}
        stopType={stopType}
        active={active}
        />
    )

    let divIconBodyMarkup = ReactDOM.renderToStaticMarkup(divIconBody)

    let icon = divIcon({html: divIconBodyMarkup})

    return (

      <Marker
        key={"key" + markerIndex}
        icon={icon}
        position={position}
        onDragend={(event) => { handleDragEnd(isQuay, markerIndex, event) }}
        draggable={draggable && active}
        >
        <Popup
          style={{bottom: 38, color: 'red'}}
          >
          <div>
            <span style={{fontWeight: 600, color: '#00bcd4', fontSize: '1.2em', cursor: 'pointer',
              marginBottom: 10, display: 'inline-block', width: '100%', textAlign: 'center', marginBottom: 15
            }}
            onClick={handleOnClick}
            >{children}</span>
            <div
              id={"pmPosition" + markerIndex}
              style={{display: 'block', borderBottom: '1px dotted black', cursor: 'pointer', width: 'auto'}}
              onClick={() => changeCoordinates && changeCoordinates(isQuay, markerIndex, position)}
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
    )
  }
}


const getIconIdByModality = (type) => {

  const modalityMap = {
    'onstreetBus': 'bus-withoutBox',
    'onstreetTram' : 'tram-withoutBox',
    'railStation' : 'rail-withoutBox',
    'metroStation' : 'subway-withoutBox',
    'busStation': 'bus-withoutBox',
    'ferryStop' : 'ferry-withoutBox',
    'airport' : 'airplane-withoutBox',
    'harbourPort' : 'ferry-withoutBox',
    'liftStation': 'lift'
  }
  var iconId = modalityMap[type]

  return iconId || 'no-information'
}


class SuperIcon extends React.Component {

  render() {

    const { markerIndex, isQuay, stopType, active } = this.props
    const iconId = getIconIdByModality(stopType)
    const fillClass = (active && isQuay) ? "quay" : active ? "" : "neighbour-stop"

    const iconSize = isQuay ? [22, 33] : [30, 45]
    const iconAnchor = isQuay ? [11, 28] : [17, 42]
    const shadowAnchor = isQuay ? [11, 8] : [10, 12]

    return (
      <div id={'stop-marker-' + markerIndex }>
        <svg className={'stop-marker-parent ' + fillClass}>
          <use xlinkHref={stopIcon + '#marker'}/>
        </svg>
        {isQuay
          ? <div className="q-marker">Q</div>
          : <svg className='stop-marker-svg'>
              <use xlinkHref={config.endpointBase + 'static/icons/svg-sprite.svg#icon-icon_' + iconId} />
            </svg>
         }
      </div>
    )
  }

}

export default CustomPopupMarker

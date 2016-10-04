import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Marker, Popup } from 'react-leaflet'

class NewStopMarker extends React.Component {

  render() {

    let { children, position, handleOnClick, handleDragEnd, text } = this.props

    const buttonStyle = {
      borderStyle: "none",
      fontWeight: "600",
      cursor: "pointer",
      textDecoration: "underline",
      background: "#fff",
      padding: "1px",
      width: "100%",
      verticalAlign: "middle"
    }

    return (

      <Marker
        ref="newstop-marker" 
        key={"newstop-key" }
        onDragend={(e) => { handleDragEnd(e).bind(this) }}
        draggable={true}
        position={position}
        >
        <Popup>
          <div>
            <span onClick={handleOnClick}>{children}</span>
              <div>
                <p style={{fontWeight: "600"}}>{text.newStopTitle}</p>
                <p>{text.newStopQuestion}</p>
                <button
                  style={buttonStyle}
                  onClick={() => { handleOnClick(position) } }
                  >
                  {text.createNow}
                </button>
              </div>
          </div>
        </Popup>
      </Marker>
    )
  }
}

export default NewStopMarker

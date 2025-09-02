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
import { Marker } from 'react-leaflet';
import { shallowCompareParkingMarker as shallowCompare } from './shallowCompare/';
import L from "leaflet";
import {UserActions} from "../../actions";
import {connect} from "react-redux";


class CustomClusterMarker extends React.Component {

    static propTypes = {
        position: PropTypes.arrayOf(Number),
        id: Number,
        size: Number,
        clusterThreshold: Number

    };

    shouldComponentUpdate(nextProps) {
        return shallowCompare(this.props, nextProps);
    }

    handleClick(position ){
        const {dispatch, clusterThreshold} = this.props;
        dispatch(UserActions.setCenterAndZoom(position,clusterThreshold));
    }



    render() {
        const {
            position,
            id,
            size
        } = this.props;

        const icon = L.divIcon({
            className: "green-icon",
            iconSize: [40, 40],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            html: `<span class="icon-text">${size}</span>`
        });

        const markerLocation = position || [44.373,-2.11771];
        if (!markerLocation) return null;

        const markerKey = "spCluster-" + id;

        return (

            <Marker position={position}  key={markerKey} icon={icon} onClick={() => this.handleClick(position)}>
            </Marker>



        );
    }


}

const mapStateToProps = state => ({
    clusterThreshold: state.user.clusterThreshold
});




export default connect(mapStateToProps)(CustomClusterMarker);

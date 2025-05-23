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
import MarkerList from './MarkerList';
import {LayersControl, Map as Lmap, ScaleControl, TileLayer, ZoomControl,} from 'react-leaflet';
import MultiPolylineList from './PathLink';
import MultimodalStopEdges from './MultimodalStopEdges';
import StopPlaceGroupList from './StopPlaceGroupList';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

export default class LeafLetMap extends React.Component {
  getCheckedBaseLayerByValue(value) {
    return this.props.activeBaselayer === value;
  }

  handleBaselayerChanged(element) {
    this.props.handleBaselayerChanged(element.name);
  }

  getCenterPosition(position) {
    if (!position) {
      return window.config.defaultMapCentroid;
    }
    return Array.isArray(position)
      ? position.map(pos => Number(pos))
      : [Number(position.lat), Number(position.lng)];
  }

  componentDidMount() {
    if (this.props.onMapReady && this.refs.map) {
      this.props.onMapReady(this.refs.map.leafletElement);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.onMapReady && this.refs.map) {
      this.props.checkNeighboursAndReload(this.refs.map.leafletElement);
    }
  }

  render() {

    const {
      position,
      zoom,
      handleDragEnd,
      handleChangeCoordinates,
      handleOnClick,
      minZoom,
      handleSetCompassBearing,
      markers,
      dragableMarkers,
      onDoubleClick,
      handleZoomEnd
    } = this.props;


    const { BaseLayer } = LayersControl;

    const lmapStyle = {
      border: '2px solid #eee',
    };

    const centerPosition = this.getCenterPosition(position);

    return (
      <Lmap
        ref="map"
        style={lmapStyle}
        center={centerPosition}
        className="leaflet-map"
        onZoomEnd={e => handleZoomEnd && handleZoomEnd(e)}
        zoom={zoom}
        zoomControl={false}
        minZoom={minZoom || null}
        onDblclick={e => onDoubleClick && onDoubleClick(e, this.refs.map)}
        OnBaselayerChange={this.handleBaselayerChanged.bind(this)}
        onclick={event => {
          handleOnClick && handleOnClick(event, this.refs.map);
        }}
      >
        <LayersControl position="topright">
          <BaseLayer
              checked={this.getCheckedBaseLayerByValue('Atlas')}
              name="Atlas"
          >
            <TileLayer
                attribution="Carte &copy; <a href='https://www.thunderforest.com/'>Thunderforest</a>,
                Données cartographiques &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"
                url="//{s}.tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=0d925ffb1c7f4fa29c090405b4038b96"
                maxZoom="19"

            />
          </BaseLayer>
          <BaseLayer
              checked={this.getCheckedBaseLayerByValue('Carte satellite IGN')}
              name="Carte satellite IGN">
            <TileLayer
                attribution="IGN-F/Geoportail"
                url="//wxs.ign.fr/decouverte/geoportail/wmts?&REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&TILEMATRIXSET=PM&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&FORMAT=image/jpeg&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}"
                maxZoom="19"
            />
          </BaseLayer>
        </LayersControl>
        <ScaleControl imperial={false} position="bottomright" />
        <ZoomControl position="bottomright" />
        <MarkerClusterGroup>
          <MarkerList
              changeCoordinates={handleChangeCoordinates}
              markers={markers}
              handleDragEnd={handleDragEnd}
              dragableMarkers={dragableMarkers}
              handleSetCompassBearing={handleSetCompassBearing}
          />
        </MarkerClusterGroup>
        <MultimodalStopEdges
          stops={markers}
        />
        <MultiPolylineList/>
        <StopPlaceGroupList/>
      </Lmap>
    );
  }
}

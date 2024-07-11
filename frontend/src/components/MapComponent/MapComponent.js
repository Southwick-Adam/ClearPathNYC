
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL } from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import simulateFetchParks from '../../assets/geodata/parks.js';
import fetchInitialPOI from '../../assets/geodata/initialPOI.js';
import floraImage from '../../assets/images/flora.png';
import poiImage from '../../assets/images/POI_marker_blue.png';
import { convertToGeoJSON } from './MapHelper/geojsonHelpers.js';
import { addRouteMarkers, addRouteToMap } from './MapHelper/routeHelpers.js';
import { addMarkers, add311Markers, plotRoutePOI, add311Multiple } from './MapHelper/markerHelpers.js';
import fetchNoise311 from '../../assets/geodata/fetchNoise311.js';
import fetchGarbage311 from '../../assets/geodata/fetchGarbage311.js';
import fetchOther311 from '../../assets/geodata/fetchOther311.js';
import poiGeojson from '../../assets/geodata/171_POIs.json';
import fetchMulti311 from '../../assets/geodata/fetchMulti311.js';
import useStore from '../../store/store.js';
import PopupContent from '../PopupContent/PopupContent.js';
import mapUnfoldVid from '../../assets/videos/mapunfolding.mp4';

function MapComponent({ route, startGeocoderRef, endGeocoderRef, geocoderRefs, playVideo }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const {
    setStartCord, setEndCord, setWaypointAndIncrease,
    waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5,
    visibleWaypoints
  } = useStore();

  const reverseGeocode = async (lng, lat) => {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    return data.features[0]?.place_name || 'Unknown location';
  };

  const updateStartInput = async (coordinates) => {
    if (startGeocoderRef.current) {
      const placeName = await reverseGeocode(coordinates[0], coordinates[1]);
      startGeocoderRef.current.setInput(placeName);
    }
  };

  const updateEndInput = async (coordinates) => {
    if (endGeocoderRef.current) {
      const placeName = await reverseGeocode(coordinates[0], coordinates[1]);
      endGeocoderRef.current.setInput(placeName);
    }
  };

  const updateWaypointInput = async (index, coordinates) => {
    const placeName = await reverseGeocode(coordinates[0], coordinates[1]);
    geocoderRefs[index].current.setInput(placeName);
  };

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URL,
      center: [-73.9712, 40.7831],
      zoom: 13,
      minZoom: 13,
      maxZoom: 20,
      accessToken: MAPBOX_TOKEN,
      pitch: 50,
      bearing: -2.6
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current.on('load', () => {
      isMapLoadedRef.current = true;

      if (videoEnded) {
        addMapFeatures();
      }
    });
  }, []);

  useEffect(() => {
    if (videoEnded && isMapLoadedRef.current) {
      addMapFeatures();
    }
  }, [videoEnded, isMapLoadedRef.current]);

  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;

    if (mapRef.current.getSource('route')) {
      mapRef.current.getSource('route').setData(route);
    } else {
      addRouteToMap(mapRef, route);
      addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef);
    }
    addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef);

    zoomToRoute(route);
  }, [route]);

  const addMapFeatures = () => {
    const initialPOI = fetchInitialPOI();
    const parkData = simulateFetchParks();
    addMarkers(mapRef, initialPOI, 'poi');
    const parkGeoJson = convertToGeoJSON(parkData);

    mapRef.current.loadImage(floraImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('flora-marker', image);
    });

    mapRef.current.loadImage(poiImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('poi-marker', image);
    });

    mapRef.current.addSource('parks', {
      type: 'geojson',
      data: parkGeoJson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    mapRef.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'parks',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#4CAF50',
          100,
          '#388E3C',
          750,
          '#2E7D32'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ],
        'circle-opacity': 0.6
      }
    });

    mapRef.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'parks',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#FFFFFF'
      }
    });

    mapRef.current.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'parks',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'flora-marker',
        'icon-size': 0.5,
        'icon-offset': [0, -0]
      }
    });

    mapRef.current.on('click', 'unclustered-point', e => {
      const coordinates = e.features[0].geometry.coordinates.slice();
      const { name } = e.features[0].properties;

      const popupNode = document.createElement('div');
      ReactDOM.render(
        <PopupContent
          coordinates={coordinates}
          name={name}
          setStartCord={setStartCord}
          setEndCord={setEndCord}
          setWaypointAndIncrease={setWaypointAndIncrease}
          updateStartInput={updateStartInput}
          updateEndInput={updateEndInput}
          updateWaypointInput={updateWaypointInput}
          geocoderRefs={geocoderRefs}
        />,
        popupNode
      );

      new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
        .setLngLat(coordinates)
        .setDOMContent(popupNode)
        .addTo(mapRef.current);
    });

    mapRef.current.on('mouseenter', 'clusters', () => {
      mapRef.current.getCanvas().style.cursor = 'pointer';
    });
    mapRef.current.on('mouseleave', 'clusters', () => {
      mapRef.current.getCanvas().style.cursor = '';
    });

    mapRef.current.on('mouseenter', 'unclustered-point', () => {
      mapRef.current.getCanvas().style.cursor = 'pointer';
    });
    mapRef.current.on('mouseleave', 'unclustered-point', () => {
      mapRef.current.getCanvas().style.cursor = '';
    });

    mapRef.current.on('click', 'clusters', e => {
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      mapRef.current.getSource('parks').getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err) return;

          mapRef.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom
          });
        }
      );
    });
  };

  const zoomToRoute = (route) => {
    if (!route.features || !Array.isArray(route.features) || route.features.length === 0) {
      console.error('Invalid route data');
      return;
    }

    const coordinates = route.features[0].geometry.coordinates;
    let bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    const expandFactor = 0.001;
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    bounds = bounds.extend([northEast.lng + expandFactor, northEast.lat + expandFactor]);
    bounds = bounds.extend([southWest.lng - expandFactor, southWest.lat - expandFactor]);

    mapRef.current.fitBounds(bounds, { padding: 100 });

    plotRoutePOI(mapRef, poiGeojson, bounds);

    const noise311 = fetchNoise311().filter(location => bounds.contains(location.coordinates));
    const garbage311 = fetchGarbage311().filter(location => bounds.contains(location.coordinates));
    const other311 = fetchOther311().filter(location => bounds.contains(location.coordinates));
    const multi311 = fetchMulti311().filter(location => bounds.contains(location.coordinates));

    add311Markers(mapRef, noise311, 'Noise');
    add311Markers(mapRef, garbage311, 'Garbage');
    add311Markers(mapRef, other311, 'Other');
    add311Multiple(mapRef, multi311);
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setShowMap(true);
  };

  return (
    <div className="map-container">
      <div className="map" ref={mapContainerRef} />
      {playVideo && !showMap && (
        <video autoPlay onEnded={handleVideoEnd} className="mapUnfoldVid">
          <source src={mapUnfoldVid} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}

MapComponent.propTypes = {
  route: PropTypes.object,
  startGeocoderRef: PropTypes.object,
  endGeocoderRef: PropTypes.object,
  geocoderRefs: PropTypes.array,
  playVideo: PropTypes.bool.isRequired // Ensure playVideo is a required prop
};

export default MapComponent;

import React, { useRef, useEffect, useState } from 'react';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL } from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import { addRouteMarkers, addRouteToMap, zoomToRoute, clearRoute } from './MapHelper/routeHelpers.js';
import { addMapFeatures, clearMapFeatures } from './MapHelper/markerHelpers.js';
import useStore from '../../store/store.js';
import mapUnfoldVid from '../../assets/videos/mapunfolding.mp4';
import simulateFetchParks from '../../assets/geodata/parks.js';
import fetchInitialPOI from '../../assets/geodata/initialPOI.js';
import floraImage from '../../assets/images/flora.png';
import poiImage from '../../assets/images/POI_marker_blue.png';
import noiseHighImage from '../../assets/images/orange_volume.png';
import noiseVeryHighImage from '../../assets/images/high_volume.png';
import garbageHighImage from '../../assets/images/rubbish_orange.png';
import otherHighImage from '../../assets/images/construction_orange.png';
import multiHighImage from '../../assets/images/orange_warning.png';
import multiVeryHighImage from '../../assets/images/red_warning.png';
import { convertToGeoJSON } from './MapHelper/geojsonHelpers.js';
import { add311Markers, plotRoutePOI,add311Multiple } from './MapHelper/markerHelpers.js';
import fetchNoise311 from '../../assets/geodata/fetchNoise311.js';
import fetchGarbage311 from '../../assets/geodata/fetchGarbage311.js';
import fetchOther311 from '../../assets/geodata/fetchOther311.js';
import poiGeojson from '../../assets/geodata/171_POIs.json';
import fetchMulti311 from '../../assets/geodata/fetchMulti311.js';

function MapComponent({ route, startGeocoderRef, endGeocoderRef, geocoderRefs, playVideo }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const waypointRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];


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
        addMapFeatures(mapRef, {
          fetchInitialPOI,
          simulateFetchParks,
          convertToGeoJSON,
          floraImage,
          noiseHighImage,
          noiseVeryHighImage,
          garbageHighImage,
          otherHighImage,
          multiHighImage,
          multiVeryHighImage,
          poiImage,
          setStartCord,
          setEndCord,
          setWaypointAndIncrease,
          updateStartInput,
          updateEndInput,
          updateWaypointInput,
          geocoderRefs
        });
      }
    });
  }, []);

  useEffect(() => {
    if (videoEnded && isMapLoadedRef.current) {
      addMapFeatures(mapRef, {
        fetchInitialPOI,
        simulateFetchParks,
        convertToGeoJSON,
        floraImage,
        noiseHighImage,
        noiseVeryHighImage,
        garbageHighImage,
        otherHighImage,
        multiHighImage,
        multiVeryHighImage,
        poiImage,
        setStartCord,
        setEndCord,
        setWaypointAndIncrease,
        updateStartInput,
        updateEndInput,
        updateWaypointInput,
        geocoderRefs
      });
    }
  }, [videoEnded, isMapLoadedRef.current]);

  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;

    clearRoute(mapRef); // Clear existing route and markers
    clearMapFeatures(mapRef); // Clear existing POI markers and clusters

    addRouteToMap(mapRef, route);
    addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef,waypointRefs);

    zoomToRoute(mapRef, route, {
      plotRoutePOI,
      poiGeojson,
      fetchNoise311,
      fetchGarbage311,
      fetchOther311,
      fetchMulti311,
      add311Markers,
      add311Multiple
    });
  }, [route]);

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

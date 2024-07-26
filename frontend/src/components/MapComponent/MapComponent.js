import React, { useRef, useEffect, useState } from 'react';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_DAY_STYLE_URL, MAPBOX_NIGHT_STYLE_URL } from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import { addRouteMarkers, addRouteToMap, zoomToRoute, clearRoute, updateRouteColors } from './MapHelper/routeHelpers.js';
import { addMapFeatures, clearMapFeatures, toggleLayerVisibility } from './MapHelper/markerHelpers.js';
import useStore from '../../store/store.js';
import mapUnfoldVid from '../../assets/videos/mapunfolding.mp4';
import simulateFetchParks from '../../assets/geodata/parks.js';
import fetchInitialPOI from '../../assets/geodata/initialPOI.js';
import floraImage from '../../assets/images/flora.png';
import poiImage from '../../assets/images/POI_marker_blue.png';
import floraImageCB from '../../assets/images/flora_CB.png';
import noiseHighImage from '../../assets/images/orange_volume.png';
import noiseVeryHighImage from '../../assets/images/high_volume.png';
import garbageHighImage from '../../assets/images/rubbish_orange.png';
import otherHighImage from '../../assets/images/Road_Warning_orange.png';
import multiHighImage from '../../assets/images/orange_warning.png';
import multiVeryHighImage from '../../assets/images/red_warning.png';
import { convertToGeoJSON } from './MapHelper/geojsonHelpers.js';
import { add311Markers, plotRoutePOI, add311Multiple, reloadParkFeature } from './MapHelper/markerHelpers.js';
import fetchNoise311 from '../../assets/geodata/fetchNoise311.js';
import fetchGarbage311 from '../../assets/geodata/fetchGarbage311.js';
import fetchOther311 from '../../assets/geodata/fetchOther311.js';
import poiGeojson from '../../assets/geodata/171_POIs.json';
import fetchMulti311 from '../../assets/geodata/fetchMulti311.js';

function MapComponent({ route, loopGeocoderRef, startGeocoderRef, endGeocoderRef, geocoderRefs, playVideo, layerVisibility, setPresentLayers }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const waypointRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const { setStartCord, setEndCord, setWaypointAndIncrease, setLoopCord, waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5, visibleWaypoints, isNightMode, isColorBlindMode, routes, loopCord, startCord, endCord } = useStore();

  const reverseGeocode = async (lng, lat) => {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    return data.features[0]?.place_name || 'Unknown location';
  };

  const updateLoopStartInput = async (coordinates) => {
    if (loopGeocoderRef.current) {
      const placeName = await reverseGeocode(coordinates[0], coordinates[1]);
      loopGeocoderRef.current.setInput(placeName);
    }
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

  const saveLayersAndSources = (map) => {
    const layers = map.getStyle().layers;
    const sources = map.getStyle().sources;
    const images = map.listImages();

    const layerCopy = layers.filter((layer) => layer.id !== 'background').map((layer) => ({ ...layer }));
    const sourceCopy = { ...sources };
    const imageCopy = images.map((imageId) => ({
      id: imageId,
    }));

    return { layerCopy, sourceCopy, imageCopy };
  };

  const restoreLayersAndSources = (map, layerCopy, sourceCopy, imageCopy) => {

    Object.keys(sourceCopy).forEach((sourceId) => {
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, sourceCopy[sourceId]);
      }
    });

    layerCopy.forEach((layer) => {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    });

    imageCopy.forEach((image) => {
      if (!map.hasImage(image.id)) {
        if (image.id === 'flora-marker' ){
          map.loadImage(floraImage, (error, img) => {
            if (error) throw error;
            map.addImage('flora-marker', img);
          });
        } else if (image.id === 'flora-marker-CB') {
          map.loadImage(floraImageCB, (error, img) => {
            if (error) throw error;
            map.addImage('flora-marker-CB', img);
          });
        } 
          else if (image.id === 'poi-marker') {
          map.loadImage(poiImage, (error, img) => {
            if (error) throw error;
            map.addImage('poi-marker', img);
          });
        } else if (image.id === 'noise-high-marker') {
          map.loadImage(noiseHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('noise-high-marker', img);
          });
        } else if (image.id === 'noise-veryhigh-marker') {
          map.loadImage(noiseVeryHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('noise-veryhigh-marker', img);
          });
        } else if (image.id === 'garbage-high-marker') {
          map.loadImage(garbageHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('garbage-high-marker', img);
          });
        } else if (image.id === 'other-high-marker') {
          map.loadImage(otherHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('other-high-marker', img);
          });
        } else if (image.id === 'multi-high-marker') {
          map.loadImage(multiHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('multi-high-marker', img);
          });
        } else if (image.id === 'multi-veryhigh-marker') {
          map.loadImage(multiVeryHighImage, (error, img) => {
            if (error) throw error;
            map.addImage('multi-veryhigh-marker', img);
          });
        }
      }
    });
  };

  useEffect(() => {
    if (mapRef.current) return;
  
    const bounds = [
      [-74.3, 40.43], // Southwest coordinates
      [-73.5, 40.96], // Northeast coordinates
    ];
  
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isNightMode ? MAPBOX_NIGHT_STYLE_URL : MAPBOX_DAY_STYLE_URL,
      center: [-73.9712, 40.7831],
      zoom: 13,
      minZoom: 11,
      maxZoom: 20,
      accessToken: MAPBOX_TOKEN,
      pitch: 50,
      bearing: -2.6,
      maxBounds: bounds,
    });

    // Load images after the map is instantiated
    mapRef.current.loadImage(floraImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('flora-marker', image);
    });

    mapRef.current.loadImage(floraImageCB, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('flora-marker-CB', image);
    });

    mapRef.current.loadImage(noiseHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('noise-high-marker', image);
    });

    mapRef.current.loadImage(noiseVeryHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('noise-veryhigh-marker', image);
    });

    mapRef.current.loadImage(garbageHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('garbage-high-marker', image);
    });

    mapRef.current.loadImage(otherHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('other-high-marker', image);
    });

    mapRef.current.loadImage(multiHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('multi-high-marker', image);
    });

    mapRef.current.loadImage(multiVeryHighImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('multi-veryhigh-marker', image);
    });

    mapRef.current.loadImage(poiImage, (error, image) => {
      if (error) throw error;
      mapRef.current.addImage('poi-marker', image);
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
          setLoopCord,
          setStartCord,
          setEndCord,
          setWaypointAndIncrease,
          updateLoopStartInput,
          updateStartInput,
          updateEndInput,
          updateWaypointInput,
          geocoderRefs,
        });
      }
    });
  
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
  
    window.addEventListener('resize', handleResize);
  
    // Override addEventListener globally to force passive listeners for touch events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
  
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
        if (typeof options === 'boolean') {
          options = {
            capture: options,
            passive: true,
          };
        } else if (typeof options === 'object') {
          options.passive = true;
        }
      }
  
      originalAddEventListener.call(this, type, listener, options);
    };
  
    return () => {
      window.removeEventListener('resize', handleResize);
      // Restore the original addEventListener method on cleanup
      EventTarget.prototype.addEventListener = originalAddEventListener;
    };
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
        setLoopCord,
        setStartCord,
        setEndCord,
        setWaypointAndIncrease,
        updateLoopStartInput,
        updateStartInput,
        updateEndInput,
        updateWaypointInput,
        geocoderRefs,
      });
    }
  }, [videoEnded, isMapLoadedRef.current]);

  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;
    // Remove any existing popups
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    while (existingPopups.length > 0) {
      existingPopups[0].remove();
    }

    clearRoute(mapRef); // Clear existing route and markers
    clearMapFeatures(mapRef); // Clear existing POI markers and clusters

    console.log('Adding route to map', route); // Debug log
    addRouteToMap(mapRef); // Updated call to addRouteToMap without passing route directly

    addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef, waypointRefs);

    zoomToRoute(mapRef, route, {
      plotRoutePOI,
      poiGeojson,
      fetchNoise311,
      fetchGarbage311,
      fetchOther311,
      fetchMulti311,
      add311Markers,
      add311Multiple,
      setPresentLayers, // Pass setPresentLayers to update the state of present layers
    });
  }, [route]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;
  
    const handleNightModeChange = async () => {
      const { layerCopy, sourceCopy, imageCopy } = saveLayersAndSources(mapRef.current);
      const newStyle = isNightMode ? MAPBOX_NIGHT_STYLE_URL : MAPBOX_DAY_STYLE_URL;
  
      mapRef.current.setStyle(newStyle);
  
      mapRef.current.once('styledata', async () => {
        restoreLayersAndSources(mapRef.current, layerCopy, sourceCopy, imageCopy);
  
        try {
          if (loopCord) await updateLoopStartInput(loopCord);
          if (startCord) await updateStartInput(startCord);
          if (endCord) await updateEndInput(endCord);
          
          const waypointCords = [waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5];
          for (let i = 0; i < waypointCords.length; i++) {
            if (waypointCords[i]) await updateWaypointInput(i, waypointCords[i]);
          }
        } catch (error) {
          console.error('Error updating inputs:', error);
        }
      });
    };
  
    handleNightModeChange();
  }, [isNightMode]);
  

  useEffect(() => {
    if (mapRef.current && isMapLoadedRef.current) {
      reloadParkFeature(mapRef);
    }
  }, [isColorBlindMode]);

  useEffect(() => {
    if (mapRef.current && isMapLoadedRef.current) {
      updateRouteColors(mapRef);
    }
  }, [isColorBlindMode]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;
    toggleLayerVisibility(mapRef, layerVisibility);
  }, [layerVisibility]);

  useEffect(() => {
    if (!mapRef.current || !isMapLoadedRef.current) return;

    if (routes.length === 0) {
      clearRoute(mapRef); // Clear existing route and markers
      clearMapFeatures(mapRef); // Clear existing POI markers and clusters
    }
  }, [routes]);

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
  playVideo: PropTypes.bool.isRequired,
  layerVisibility: PropTypes.object.isRequired,
  setPresentLayers: PropTypes.func.isRequired, // Add this line
};

export default MapComponent;

import React, { useRef, useEffect } from 'react';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL } from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import simulateFetchParks from '../../assets/geodata/parks.js';
import fetchInitialPOI from '../../assets/geodata/initialPOI.js';
import floraImage from '../../assets/images/flora.png';
import poiImage from '../../assets/images/blue_marker.png'; // Change later to include a blue info icon
import { convertToGeoJSON } from './MapHelper/geojsonHelpers.js';
import { addRouteMarkers, addRouteToMap } from './MapHelper/routeHelpers.js';
import { addMarkers, add311Markers, plotRoutePOI, add311Multiple } from './MapHelper/markerHelpers.js';
import fetchNoise311 from '../../assets/geodata/fetchNoise311.js';
import fetchGarbage311 from '../../assets/geodata/fetchGarbage311.js';
import fetchOther311 from '../../assets/geodata/fetchOther311.js';
import poiGeojson from './cleaned_points_of_interest.json';
import fetchMulti311 from '../../assets/geodata/fetchMulti311.js';
import useStore from '../../store/store.js'; // Adjust the import path accordingly

function MapComponent({ route, startGeocoderRef, endGeocoderRef, geocoderRefs }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false); // Ref to track if the map is loaded
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);

  const {
    setStartCord, setEndCord, setWaypointAndIncrease,
    waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5,
    visibleWaypoints
  } = useStore();

  const reverseGeocode = async (lng, lat) => {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`);
    const data = await response.json();
    return data.features[0]?.place_name || `${lat}, ${lng}`;
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
    console.log(`updateWaypointInput called with index: ${index} and coordinates: ${coordinates}`);
      const placeName = await reverseGeocode(coordinates[0], coordinates[1]);
      console.log(`Reverse geocoded place name: ${placeName}`);
      geocoderRefs[index].current.setInput(placeName);
      console.log(`geocoderRef at index ${index} input set to: ${placeName}`);

  };

  const handleAddWaypoint = (coordinates) => {
    const newWaypointIndex = setWaypointAndIncrease(coordinates);
    console.log(`New waypoint index: ${newWaypointIndex}`);
    if (newWaypointIndex !== -1) {
      updateWaypointInput(newWaypointIndex, coordinates);
    }
  };

  useEffect(() => {
    console.log('MapComponent geocoderRefs:', geocoderRefs);
  }, [geocoderRefs]);
  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URL,
      center: [-73.9712, 40.7831],
      zoom: 13,
      minZoom: 13, // Set the minimum zoom level
      maxZoom: 20, // Set the maximum zoom level
      accessToken: MAPBOX_TOKEN
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current.on('load', () => {
      isMapLoadedRef.current = true; // Set the map as loaded

      // Fetch the initial API data for map display
      const initialPOI = fetchInitialPOI();
      // Fetch the park data for map display
      const parkData = simulateFetchParks();
      addMarkers(mapRef, initialPOI, 'poi');
      const parkGeoJson = convertToGeoJSON(parkData);

      // Load markers for clustering: Parks
      mapRef.current.loadImage(floraImage, (error, image) => {
        if (error) throw error;
        mapRef.current.addImage('flora-marker', image);
      });

      // Load markers for clustering: POIs near route
      mapRef.current.loadImage(poiImage, (error, image) => {
        if (error) throw error;
        mapRef.current.addImage('poi-marker', image);
      });

      // Not using clustering helper function as it causes bug with flora icon display
      mapRef.current.addSource('parks', {
        type: 'geojson',
        data: parkGeoJson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Clusters of park are displayed using green circles
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
          ]
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

      // Individual parks are displayed using the floral marker
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

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(name)
          .setDOMContent(createPopupContent(coordinates))
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
              zoom: zoom
            });
          }
        );
      });
    });
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;

    if (mapRef.current.getSource('route')) {
      mapRef.current.getSource('route').setData(route);
    } else {
      console.log('Drawing route...');
      addRouteToMap(mapRef, route);
      addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef);
    }
    addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef); // Ensure markers are added whenever the route changes

    // Zoom to the route whenever it changes
    zoomToRoute(route);
  }, [route]);

  const zoomToRoute = (route) => {
    if (!route.features || !Array.isArray(route.features) || route.features.length === 0) {
      console.error('Invalid route data');
      return;
    }

    const coordinates = route.features[0].geometry.coordinates;
    let bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

     // Increase the bounds for displaying 311 plotting effect
    const expandFactor = 0.003; // Adjust this factor as needed to increase the bounds
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    bounds = bounds.extend([northEast.lng + expandFactor, northEast.lat + expandFactor]);
    bounds = bounds.extend([southWest.lng - expandFactor, southWest.lat - expandFactor]);

    mapRef.current.fitBounds(bounds, {
      padding: 100
    });

    plotRoutePOI(mapRef, poiGeojson, bounds);

    // Filter and plot the POIs within the bounds
    const noise311 = fetchNoise311().filter(location => bounds.contains(location.coordinates));
    const garbage311 = fetchGarbage311().filter(location => bounds.contains(location.coordinates));
    const other311 = fetchOther311().filter(location => bounds.contains(location.coordinates));
    const multi311 = fetchMulti311().filter(location => bounds.contains(location.coordinates));

    add311Markers(mapRef, noise311, 'Noise');
    add311Markers(mapRef, garbage311, 'Garbage');
    add311Markers(mapRef, other311, 'Other');
    add311Multiple(mapRef, multi311);
  };

  const createPopupContent = (coordinates) => {
    const container = document.createElement('div');
    const setStartButton = document.createElement('button');
    setStartButton.innerText = 'Set Start';
    setStartButton.onclick = async () => {
      setStartCord(coordinates);
      await updateStartInput(coordinates);
    };

    const setEndButton = document.createElement('button');
    setEndButton.innerText = 'Set End';
    setEndButton.onclick = async () => {
      setEndCord(coordinates);
      await updateEndInput(coordinates);
    };

    const setWaypointButton = document.createElement('button');
    setWaypointButton.innerText = 'Set Waypoint';
    setWaypointButton.onclick = async () => {
      handleAddWaypoint(coordinates);
    };

    container.appendChild(setStartButton);
    container.appendChild(setEndButton);
    container.appendChild(setWaypointButton);

    return container;
  };

  return <div ref={mapContainerRef} className='map' />;
}

MapComponent.propTypes = {
  route: PropTypes.object,
  startGeocoderRef: PropTypes.object.isRequired,
  endGeocoderRef: PropTypes.object.isRequired,
  geocoderRefs: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MapComponent;

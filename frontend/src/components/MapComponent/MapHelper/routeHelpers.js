import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import { animateMarkers, addClusteredLayer } from './markerHelpers';
import { convertToGeoJSON } from './geojsonHelpers.js';
import useStore from '../../../store/store.js';

export function addRouteToMap(mapRef) {
  const route = useStore.getState().routes[useStore.getState().selectedRouteIndex];
  const isColorBlindMode = useStore.getState().isColorBlindMode;

  console.log('Route to add to map:', route); // Debug log

  if (!route) {
    console.error('No route found in store.');
    return;
  }

  // Extract coordinates and quietness score from the route data
  const coordinates = route.geometry.coordinates;
  const quietnessScore = route.properties.quietness_score;

  // Create a GeoJSON line string with properties including quietness score
  const lineString = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };

  if (mapRef.current.getSource('route')) {
    mapRef.current.getSource('route').setData(lineString);
  } else {
    mapRef.current.addSource('route', {
      type: 'geojson',
      data: lineString,
      lineMetrics: true,
    });

    // Prepare the line gradient stops based on quietness score
    const lineGradient = ['interpolate', ['linear'], ['line-progress']];
    for (let i = 0; i < quietnessScore.length; i++) {
      const progress = i / (quietnessScore.length - 1);
      const color = getColorForQuietness(quietnessScore[i], isColorBlindMode);
      lineGradient.push(progress, color);
    }

    mapRef.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-width': 10,
        'line-gradient': lineGradient,
      },
    });
  }
}

// Function to map quietness score to a color based on predefined ranges
function getColorForQuietness(score, isColorBlindMode) {
  if (isColorBlindMode) {
    if (score >= 4) return '#FF0000'; // Red for scores 4-5
    if (score >= 2 && score <= 3) return 'orange'; // Orange for scores 2-3
    if (score <= 1) return '#62309C'; // Purple for scores 0-1
  } else {
    if (score >= 4) return '#FF0000'; // Red for scores 4-5
    if (score >= 2 && score <= 3) return 'orange'; // Orange for scores 2-3
    if (score <= 1) return '#189e01'; // Green for scores 0-1
  }
}


// Function to add markers with animations
export function addRouteMarkers(mapRef, routeData, startMarkerRef, endMarkerRef, waypointRefs) {
  const startCoord = routeData.geometry.coordinates[0];
  const endCoord = routeData.geometry.coordinates[routeData.geometry.coordinates.length - 1];

  // Clear existing waypoint markers
  waypointRefs.forEach(ref => {
    if (ref.current) {
      ref.current.remove();
      ref.current = null;
    }
  });

  const { waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5, visibleWaypoints } = useStore.getState();

  const waypointCoords = [waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5];
  const waypointClasses = ['waypoint1_marker', 'waypoint2_marker', 'waypoint3_marker', 'waypoint4_marker', 'waypoint5_marker'];

  // Draw markers in sequence
  let timeout = 0;

  // Add start marker
  setTimeout(() => {
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }

    const startMarker = document.createElement('div');
    startMarker.className = 'marker start_marker bounce'; // Add bounce class and identifiable class

    startMarkerRef.current = new mapboxgl.Marker({
      element: startMarker,
      offset: [0, -15]
    })
      .setLngLat(startCoord)
      .addTo(mapRef.current);

    animateMarkers($(startMarker));
  }, timeout);

  timeout += 200; // Adjust delay as needed

  // Add waypoint markers
  for (let i = 0; i < visibleWaypoints; i++) {
    if (waypointCoords[i]) {
      setTimeout(() => {
        const waypointMarker = document.createElement('div');
        waypointMarker.className = `marker ${waypointClasses[i]}`;

        waypointRefs[i].current = new mapboxgl.Marker({
          element: waypointMarker,
          offset: [0, -15]
        })
          .setLngLat(waypointCoords[i])
          .addTo(mapRef.current);

        animateMarkers($(waypointMarker));
      }, timeout);

      timeout += 200; // Adjust delay as needed
    }
  }

  // Add end marker only if start and end coordinates are different
  if (startCoord[0] !== endCoord[0] || startCoord[1] !== endCoord[1]) {
    setTimeout(() => {
      if (endMarkerRef.current) {
        endMarkerRef.current.remove();
        endMarkerRef.current = null;
      }

      const endMarker = document.createElement('div');
      endMarker.className = 'marker end_marker';

      endMarkerRef.current = new mapboxgl.Marker({
        element: endMarker,
        offset: [0, -15]
      })
        .setLngLat(endCoord)
        .addTo(mapRef.current);

      animateMarkers($(endMarker));
    }, timeout);
  }
}



export function zoomToRoute(mapRef, route, helpers) {
  const { fetchNoise311, fetchGarbage311, fetchOther311, fetchMulti311, setPresentLayers } = helpers;

  if (!route.geometry || !Array.isArray(route.geometry.coordinates) || route.geometry.coordinates.length === 0) {
    console.error('Invalid route data');
    return;
  }

  const coordinates = route.geometry.coordinates;
  let bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

  const expandFactor = 0.0001;
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  bounds = bounds.extend([northEast.lng + expandFactor, northEast.lat + expandFactor]);
  bounds = bounds.extend([southWest.lng - expandFactor, southWest.lat - expandFactor]);

  const pitch = 50;
  const bearing = -2.6;
  const center = bounds.getCenter();
  const zoom = mapRef.current.getZoom();

  setTimeout(() => {
    mapRef.current.easeTo({
      center: center,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      duration: 1000
    });
  }, 0);

  mapRef.current.fitBounds(bounds, { padding: 100 });

  const noise311 = fetchNoise311().filter(location => bounds.contains(location.coordinates));
  const garbage311 = fetchGarbage311().filter(location => bounds.contains(location.coordinates));
  const other311 = fetchOther311().filter(location => bounds.contains(location.coordinates));
  const multi311 = fetchMulti311().filter(location => bounds.contains(location.coordinates));

  const noise311high = convertToGeoJSON(noise311.filter(location => (location.category === "High")));
  const noise311veryhigh = convertToGeoJSON(noise311.filter(location => (location.category === "Very High")));
  const garbagehigh = convertToGeoJSON(garbage311);
  const otherhigh = convertToGeoJSON(other311);
  const multihigh = convertToGeoJSON(multi311.filter(location => (location.severity === "High")));
  const multiveryhigh = convertToGeoJSON(multi311.filter(location => (location.severity === "Very High")));

  // Update the present layers state
  setPresentLayers({
    noise: noise311.length > 0,
    trash: garbage311.length > 0,
    multipleWarnings: multi311.length > 0,
    other: other311.length > 0,
  });

  addClusteredLayer(mapRef, noise311high, 'route-noise-h', 'noise-high-marker', 'orange');
  addClusteredLayer(mapRef, noise311veryhigh, 'route-noise-vh', 'noise-veryhigh-marker', 'red');
  addClusteredLayer(mapRef, garbagehigh, 'route-garbage-h', 'garbage-high-marker', 'orange');
  addClusteredLayer(mapRef, otherhigh, 'route-other-h', 'other-high-marker', 'orange');
  addClusteredLayer(mapRef, multihigh, 'route-multi-h', 'multi-high-marker', 'orange');
  addClusteredLayer(mapRef, multiveryhigh, 'route-multi-vh', 'multi-veryhigh-marker', 'red');
}

export function clearRoute(mapRef) {
  if (mapRef.current.getSource('route')) {
    mapRef.current.removeLayer('route');
    mapRef.current.removeSource('route');
  }

  // Remove markers by querying their classes
  const markerClasses = ['start_marker', 'end_marker', 'waypoint1_marker', 'waypoint2_marker', 'waypoint3_marker', 'waypoint4_marker', 'waypoint5_marker'];
  
  markerClasses.forEach(className => {
    const markerElements = document.querySelectorAll(`.${className}`);
    markerElements.forEach(markerElement => {
      markerElement.remove();
    });
  });
}


export function updateRouteColors(mapRef) {
  const route = useStore.getState().routes[useStore.getState().selectedRouteIndex];
  const isColorBlindMode = useStore.getState().isColorBlindMode;

  if (!route) {
    return;
  }

  const quietnessScore = route.properties.quietness_score;

  // Prepare the line gradient stops based on quietness score
  const lineGradient = ['interpolate', ['linear'], ['line-progress']];
  for (let i = 0; i < quietnessScore.length; i++) {
    const progress = i / (quietnessScore.length - 1);
    const color = getColorForQuietness(quietnessScore[i], isColorBlindMode);
    lineGradient.push(progress, color);
  }

  if (mapRef.current.getLayer('route')) {
    mapRef.current.setPaintProperty('route', 'line-gradient', lineGradient);
  }
}

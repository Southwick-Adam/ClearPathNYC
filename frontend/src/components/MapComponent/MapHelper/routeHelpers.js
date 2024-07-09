import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import { animateMarkers } from './markerHelpers';


export function addRouteToMap(mapRef, routeData) {
  mapRef.current.addSource('route', {
    type: 'geojson',
    data: routeData,
    lineMetrics: true,
  });

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
      'line-gradient': [
        'interpolate',
        ['linear'],
        ['line-progress'],
        0, '#ff0000',
        0.33, '#ffff00',
        0.66, '#00ff00',
        1, '#00ff00'
      ],
    },
  });
}

export function addRouteMarkers(mapRef, routeData, startMarkerRef, endMarkerRef) {
  const startCoord = routeData.features[0].geometry.coordinates[0];
  const endCoord = routeData.features[0].geometry.coordinates[routeData.features[0].geometry.coordinates.length - 1];

  if (endMarkerRef.current) {
    endMarkerRef.current.remove();
    endMarkerRef.current = null;
  }

  if (startMarkerRef.current) {
    startMarkerRef.current.setLngLat(startCoord);
  } else {
    const startMarker = document.createElement('div');
    startMarker.className = 'marker start_marker';

    startMarkerRef.current = new mapboxgl.Marker({
      element: startMarker,
      offset: [0, -15]
    })
      .setLngLat(startCoord)
      .addTo(mapRef.current);

      animateMarkers($(startMarker));
  }

  const isLoop = routeData.features[0].properties.isLoop;

  if (!isLoop) {
    if (endMarkerRef.current) {
      endMarkerRef.current.setLngLat(endCoord);
    } else {
      const endMarker = document.createElement('div');
      endMarker.className = 'marker end_marker';

      endMarkerRef.current = new mapboxgl.Marker({
        element: endMarker,
        offset: [0, -15]
      })
        .setLngLat(endCoord)
        .addTo(mapRef.current);

        animateMarkers($(endMarker));
    }
  }
}

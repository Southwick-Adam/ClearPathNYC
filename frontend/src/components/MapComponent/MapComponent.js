import React, {useRef, useEffect}from 'react';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL} from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import $ from 'jquery';



function MapComponent({route}){
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isMapLoadedRef = useRef(false); // Ref to track if the map is loaded
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);


  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAPBOX_STYLE_URL,
      center: [-73.9712, 40.7831],
      zoom: 13,
      accessToken: MAPBOX_TOKEN
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current.on('load', () => {
      isMapLoadedRef.current = true; // Set the map as loaded
      
      // Simulate fetching POI data from backend
      const poiData = simulateFetchPOI();
      addPOIMarkers(poiData);

      // If there's an existing route, add it when the map is loaded
      if (route) {
        addRouteToMap(route);
      }
    });
  }, []); // Empty dependency array ensures this runs only once


  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;

      if (mapRef.current.getSource('route')){
        mapRef.current.getSource('route').setData(route);
      } else{
        console.log('Drawing route...');
        addRouteToMap(route);
        addRouteMarkers(route);
      }
      addRouteMarkers(route); // Ensure markers are added whenever the route changes
    },[route]);
  
  function addRouteToMap(routeData){
    mapRef.current.addSource('route', {
      type: 'geojson',
      data: routeData,
      lineMetrics: true,
    });

    mapRef.current.addLayer({
      // For now draw the routes using gradient color. If later we decide to have solid blocks of colors it can be adjsuted
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
    
  };

  

  function addRouteMarkers(routeData){
    const startCoord = routeData.features[0].geometry.coordinates[0];
    const endCoord = routeData.features[0].geometry.coordinates[routeData.features[0].geometry.coordinates.length - 1];

    // Always remove any existing end marker
    if (endMarkerRef.current) {
      endMarkerRef.current.remove();
      endMarkerRef.current = null;
    }
    // Add start marker
    if (startMarkerRef.current) {
      startMarkerRef.current.setLngLat(startCoord);
    } else {
      const startMarker = document.createElement('div');
      startMarker.className='marker start_marker';

      startMarkerRef.current = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -15]
      })
        .setLngLat(startCoord)
        .addTo(mapRef.current);

        animateMarker($(startMarker))
    }

    // Check if the route is a loop
    const isLoop = routeData.features[0].properties.isLoop;

    // Add end marker if it's not a loop
    if (!isLoop) {
      if (endMarkerRef.current) {
        endMarkerRef.current.setLngLat(endCoord);
      } else {
        const endMarker = document.createElement('div');
        endMarker.className='marker end_marker';

        endMarkerRef.current = new mapboxgl.Marker({
          element: endMarker,
          offset: [0, -15]
        })
          .setLngLat(endCoord)
          .addTo(mapRef.current);

          animateMarker($(endMarker));

      }
    }
  }

  // Simulate fetching poi data from backend for now
  function simulateFetchPOI(){
    return [
      {
        name: "Central Park",
        coordinates: [-73.9654, 40.7829]
      },
      {
        name: "Times Square",
        coordinates: [-73.9851, 40.7580]
      },
      {
        name: "Empire State Building",
        coordinates: [-73.9857, 40.7484]
      },
      {
        name: "Statue of Liberty",
        coordinates: [-74.0445, 40.6892]
      },
      {
        name: "Brooklyn Bridge",
        coordinates: [-73.9969, 40.7061]
      }
    ];
  }

  function addPOIMarkers(poiData){
    poiData.forEach(poi=>{
      const poimarker = document.createElement('div');
      poimarker.className = 'marker poi_marker';

      new mapboxgl.Marker({
        element: poimarker,
        offset: [0, -10]
      })
        .setLngLat(poi.coordinates)
        .setPopup(new mapboxgl.Popup({offset:25}).setText(poi.name))
        .addTo(mapRef.current);

        animateMarker($(poimarker));
    });
  }

  function animateMarker($marker) {
    $marker.css({
      top: '-50px',
      opacity: 0,
    }).animate({
      top: '0px',
      opacity: 1,
    }, 500);
  }

  return <div ref={mapContainerRef} className='map' />;
}

MapComponent.propTypes = {
  route: PropTypes.object,
};

export default MapComponent;

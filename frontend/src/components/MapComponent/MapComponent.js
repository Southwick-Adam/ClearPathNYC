import React, {useRef, useEffect}from 'react';
import './MapComponent.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE_URL} from '../../config.js';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';
import simulateFetchParks from '../../assets/geodata/parks.js';
import fetchInitialPOI from '../../assets/geodata/initialPOI.js';
import floraImage from '../../assets/images/flora.png';
import { convertToGeoJSON } from './MapHelper/geojsonHelpers.js';
import { addRouteMarkers, addRouteToMap } from './MapHelper/routeHelpers.js';
import {addMarkers, animateMarkers} from './MapHelper/markerHelpers.js';


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
      
      // Fetch the 5 initial API data for map display
      const initialPOI = fetchInitialPOI();
      // Fetch the park data for map display
      const parkData = simulateFetchParks();
      addMarkers(mapRef,initialPOI,'poi');
      const parkGeoJson = convertToGeoJSON(parkData);

      mapRef.current.loadImage(floraImage, (error, image) => {
        if (error) throw error;
        mapRef.current.addImage('flora-marker', image);
      });

      mapRef.current.addSource('parks', {
        type: 'geojson',
        data: parkGeoJson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
      
      //Clusters of park are displayed using green circles
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

      // If there's an existing route, add it when the map is loaded
      if (route) {
        addRouteToMap(mapRef,route);
      }
    });
  }, []); // Empty dependency array ensures this runs only once


  useEffect(() => {
    if (!route || !mapRef.current || !isMapLoadedRef.current) return;

      if (mapRef.current.getSource('route')){
        mapRef.current.getSource('route').setData(route);
      } else{
        console.log('Drawing route...');
        addRouteToMap(mapRef,route);
        addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef);
      }
      addRouteMarkers(mapRef, route, startMarkerRef, endMarkerRef); // Ensure markers are added whenever the route changes
    },[route]);

  return <div ref={mapContainerRef} className='map' />;
}

MapComponent.propTypes = {
  route: PropTypes.object,
};

export default MapComponent;

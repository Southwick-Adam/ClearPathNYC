// src/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './MapComponent.css';

const htmlIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#ff0000;width:20px;height:20px;border-radius:50%;'></div>",
    iconSize: [20, 20],
    popupAnchor: [0, -10]
  });

const MapComponent = () => {
  const position = [40.776676, -73.971321]; 

  return (
    <MapContainer className='MapContainer' center={position} zoom={13} zoomControl={false}>
      <TileLayer
        url="https://api.mapbox.com/styles/v1/yuhanhu676/clxc8detb026v01pchilze3qw/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoieXVoYW5odTY3NiIsImEiOiJjbHhjN2w0ZnAwNm56MmxzNWdkMmd1ZDl4In0.pd4slO4z3BHKConp2adKnA"
        tileSize={512}
        zoomOffset={-1}
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> contributors'
        />
      <Marker position={position} icon={htmlIcon}>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
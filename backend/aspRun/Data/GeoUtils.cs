using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class GeoUtils
{
    public static (double lat, double lon) PointInGivenDirection(double latitude, double longitude, double distanceMeters, double angleDegrees)
{
    double radiusEarthKm = 6371.0;

    // Convert distance from meters to kilometers
    double distanceKm = distanceMeters / 1000.0;

    // Convert distance from kilometers to radians
    double distanceRad = distanceKm / radiusEarthKm;

    // Convert angle from degrees to radians
    double angleRad = angleDegrees * Math.PI / 180.0;

    // Calculate new latitude
    double newLat = Math.Asin(Math.Sin(latitude * Math.PI / 180) * Math.Cos(distanceRad) +
                              Math.Cos(latitude * Math.PI / 180) * Math.Sin(distanceRad) * Math.Cos(angleRad));
    
    // Calculate new longitude
    double newLon = longitude * Math.PI / 180 + Math.Atan2(Math.Sin(angleRad) * Math.Sin(distanceRad) * Math.Cos(latitude * Math.PI / 180),
                                                           Math.Cos(distanceRad) - Math.Sin(latitude * Math.PI / 180) * Math.Sin(newLat));

    // Convert from radians to degrees
    newLat = newLat * 180 / Math.PI;
    newLon = newLon * 180 / Math.PI;

    return (newLat, newLon);
}
}


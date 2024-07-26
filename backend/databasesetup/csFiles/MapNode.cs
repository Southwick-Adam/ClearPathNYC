using System.Collections.Generic;
using System.Collections;
using Neo4j.Driver;

/// <summary>
/// Object to store information used in creating a node in the database
///</summary>
public class MapNode
{
    public long ID{get;}
    public double Latitude {get;}
    public double Longitude {get;}
    public bool Park {get; set;}
    public int TaxiZone {get; set;}
    public int RoadRank {get; set;}
    public int MetroZones {get; set;}
    public bool ThreeOneOne {get; set;}
    public List<long> vertices = [];
    public Hashtable verticesInfo = new Hashtable();


    public MapNode(long ID, double latitude, double longitude) {
        double rounded_lat = Math.Round(latitude, 6);
        double rounded_lng = Math.Round(longitude, 6);

        this.ID = ID;
        this.Latitude = rounded_lat;
        this.Longitude = rounded_lng;
    }

    public MapNode(long ID){
        this.ID = ID;
    }
    
    // TODO: Change to Dictionary

    /// <summary>
    /// Adds the Node information to a NodeInfo object
    /// </summary>
    /// <param name="node"></param>
    public void AddInfo(MapNode node){
        if (!verticesInfo.ContainsKey(node.ID))
        {
            double distance = this.NodeDistance(node);
            int quietScore = 0;

            NodeInfo nodeInfo = new(distance, quietScore);
            
            verticesInfo.Add(node.ID, nodeInfo);
            vertices.Add(node.ID);
        }
        // TODO: need to add an else, checking that the original addition had the correct values - check that it wasn't long/lat of 0.
    }


    /// <summary>
    /// used to check the distance from the current node to the desired node
    /// </summary>
    public double NodeDistance(MapNode node)
    {
        double lat2 = node.Latitude;
        double lon2 = node.Longitude;
        const double R = 6371e3; // Earth's radius in meters
        var lat1Rad = ToRadians(Latitude);
        var lat2Rad = ToRadians(lat2);
        var deltaLat = ToRadians(lat2 - Latitude);
        var deltaLon = ToRadians(lon2 - Longitude);

        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
            Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
            Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        double dist_total = R * c; // Distance in meters

        return Math.Round(dist_total, 2);
    }

    public override string ToString()
    {
        return $"ID: {this.ID},\nLong, Lat: {this.Longitude}, {this.Latitude}";
    }

    public static double ToRadians(double degrees)
    {
    return degrees * (Math.PI / 180);
    }

}

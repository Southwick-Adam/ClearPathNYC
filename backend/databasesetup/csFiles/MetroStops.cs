using System.Diagnostics;
using NetTopologySuite;
using NetTopologySuite.Geometries;
using TinyCsvParser.TypeConverter;

public class MetroStops 
{
    // uses circles for the geometry
    public Dictionary<int, Geometry> MetroDict = new Dictionary<int, Geometry>();
    // uses points for the geometry
    public Dictionary<int, Point> closestMetroDict = new Dictionary<int, Point>();

    public MetroStops(string csvMetro)
    {
        MetroDict = CreateMetroCircles(csvMetro);
    }

    private Dictionary<int, Geometry> CreateMetroCircles(string metroPath)
    {
        using (var reader = new StreamReader(metroPath))
        {
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                var values = line.Split(",");
                try
                {
                    double longitude = Double.Parse(values[2]);
                }
                catch (Exception ex) 
                {
                    Console.WriteLine(ex.ToString());
                }

                var tempPoint = new Point(Double.Parse(values[1]), Double.Parse(values[2]));
                var tempCircle = CreateCircleAndCheckPoints(Double.Parse(values[1]), Double.Parse(values[2]), 400);
                if (string.Equals(values[0].ToString(), "TRAM1"))
                {
                    closestMetroDict.Add(1,tempPoint);
                    MetroDict.Add(1, tempCircle);
                }
                else if (string.Equals(values[0].ToString(), "TRAM2"))
                {
                    closestMetroDict.Add(2,tempPoint);
                    MetroDict.Add(2, tempCircle);
                }
                else
                {
                    closestMetroDict.Add(int.Parse(values[0]),tempPoint);
                    MetroDict.Add(int.Parse(values[0]), tempCircle);
                }

            }
        }
        return MetroDict;
    }

    /// <summary>
    /// Checks if a given point is within the circle 
    /// </summary>
    /// <param name="longitude"></param>
    /// <param name="lat"></param>
    /// <returns>List of stationIDs</returns>
    public List<int> PointInCircle(double latitude, double longitude)
    {
        Point point = new(longitude, latitude);
        List<int> inCircles = [];
        foreach (int key in MetroDict.Keys)
        {   
            if  (MetroDict[key].Contains(point))
            {
                inCircles.Add(key);
            }
        }
        
        return inCircles;
    }

    /// <summary>
    /// Calculates the nearest stop using the Haversine Formula
    /// </summary>
    /// <param name="latitude"></param>
    /// <param name="longitude"></param>
    /// <returns>string: stationID</returns> 
    public int NearestMetroStop(double latitude, double longitude)
    {        
        int closestStation = -1;
        double closestStationDistance = double.MaxValue;

        foreach (var key in closestMetroDict.Keys)
        {
            var lat1 = closestMetroDict[key].X;
            var lon1 = closestMetroDict[key].Y;

            var distance = HaversineCalculator.CalculateDistance(latitude, longitude, lat1, lon1);
            if (distance < closestStationDistance)
            {
                closestStationDistance = distance;
                closestStation = key;
            }
        }

        if (closestStationDistance < 0.400) return closestStation;
        return -1;
    }




    public static Geometry CreateCircleAndCheckPoints(double latitude, double longitude, int circleSize)
    //https://stackoverflow.com/questions/70149472/how-to-make-a-circle-type-buffer-around-nettopologysuite-point-with-radius-in-n
    {
        // Define the Precision Coordinate
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326); // WGS84

        // Circle center coordinate
        var circleCenterCoordinate = new Coordinate(latitude, longitude); // long, lat
        var circleCenterPoint = geometryFactory.CreatePoint(circleCenterCoordinate);
        
        //Plot circle
        var circle = PlotCircle(circleCenterCoordinate.Y, circleCenterCoordinate.X, circleSize);      
        return circle;  
    }

    public static Geometry PlotCircle(double centerLat, double centerLon, double radiusInMeters)
    {
        // PLOTTING OF CIRCLE
        const double EarthRadiusMeters = 6371e3; // Earth's radius in meters


        // Convert nautical miles to radians
        double radiusInRadians = radiusInMeters / (EarthRadiusMeters * Math.PI / 180.0);

        // Calculate coordinates along the circumference of the circle
        var coordinates = new List<Coordinate>();
        for (int i = 0; i <= 360; i += 10) // Adjust the interval as needed
        {
            double angle = i * Math.PI / 180.0;
            double latitude = centerLat + (radiusInRadians * Math.Sin(angle));
            double longitude = centerLon + (radiusInRadians * Math.Cos(angle) / Math.Cos(centerLat * Math.PI / 180.0));

            coordinates.Add(new Coordinate(longitude, latitude));
        }
        // CREATE POLYGON
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326); // WGS84
        var circle = new Polygon(new LinearRing(coordinates.ToArray()), geometryFactory);
        

        return circle;
    }

}
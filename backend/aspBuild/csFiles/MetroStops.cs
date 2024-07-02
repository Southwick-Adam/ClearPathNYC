using NetTopologySuite;
using NetTopologySuite.Geometries;

public class MetroStops 
{
    public Dictionary<string, Geometry> MetroDict = new Dictionary<string, Geometry>();
    public MetroStops(string csvMetro)
    {
        MetroDict = CreateMetroCircles(csvMetro);
    }

    private Dictionary<string, Geometry> CreateMetroCircles(string metroPath)
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
                var tempCircle = CreateCircleAndCheckPoints(Double.Parse(values[2]), Double.Parse(values[1]));
                MetroDict.Add(values[0], tempCircle);
            }
        }
        return MetroDict;
    }

    public List<string> PointInCircle(double longitude, double lat)
    {
        Point point = new(lat, longitude);
        List<string> inCircles = [];
        foreach (string key in MetroDict.Keys)
        {   
            if  (MetroDict[key].Contains(point))
            {
                inCircles.Add(key);
            }
        }
        
        return inCircles;
    }




    public static Geometry CreateCircleAndCheckPoints(double longitude, double lat)
    //https://stackoverflow.com/questions/70149472/how-to-make-a-circle-type-buffer-around-nettopologysuite-point-with-radius-in-n
    {
        // Define the Precision Coordinate
        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(4326); // WGS84

        // Circle center coordinate
        var circleCenterCoordinate = new Coordinate(longitude, lat); // long, lat
        var circleCenterPoint = geometryFactory.CreatePoint(circleCenterCoordinate);
        
        //Plot circle
        var circle = PlotCircle(circleCenterCoordinate.Y, circleCenterCoordinate.X, 800);      
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
        
        
        string currentDirectory = Directory.GetCurrentDirectory();
        string relativeFilePath = Path.Combine(currentDirectory, "MetroStops.txt");
        using (StreamWriter writer = new StreamWriter(relativeFilePath, append:true))
            {
               writer.WriteLine($"{centerLat} {centerLon} {circle.Boundary}");
               writer.WriteLine("");
            }

        return circle;
    }

}
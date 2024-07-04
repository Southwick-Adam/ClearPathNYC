using System.Text;
using NetTopologySuite.Geometries;
using Newtonsoft.Json.Serialization;
using TinyCsvParser;
using TinyCsvParser.Mapping;

public class ThreeOneOne
{
    public Dictionary<string, Geometry> ThreeOneOneCircles = [];
    public Dictionary<string, ThreeOneOneStreet> ThreeOneOneStreet = [];

    public ThreeOneOne(string csvPath)
    {
        CreateThreeOneOneList(csvPath);
    }

    private void CreateThreeOneOneList(string csvPath)
    {
        CsvParserOptions csvParserOptions = new CsvParserOptions(true,',');
        CsvThreeOneOneMapping csvMapper = new CsvThreeOneOneMapping();
        CsvParser<ThreeOneOneStreet> csvParser = new CsvParser<ThreeOneOneStreet>(csvParserOptions, csvMapper);

        // result is a list of results, each of which contain a street object
        var result = csvParser
            .ReadFromFile(csvPath, Encoding.UTF8)
            .ToList();

        foreach (var street in result)
        {
            Geometry tempCircle;
            if (street.Result.ComplaintCategory.Equals("Noise"))
            {
                tempCircle = MetroStops.CreateCircleAndCheckPoints(street.Result.Latitude, street.Result.Longitude, 20);
            }
            else if (street.Result.ComplaintCategory.Equals("Garbage"))
            {
                tempCircle = MetroStops.CreateCircleAndCheckPoints(street.Result.Latitude, street.Result.Longitude, 10);
            }
            else 
            {
                tempCircle = MetroStops.CreateCircleAndCheckPoints(street.Result.Latitude, street.Result.Longitude, 20);
            }

            ThreeOneOneCircles.Add(street.Result.UniqueKey, tempCircle);
            ThreeOneOneStreet.Add(street.Result.UniqueKey, street.Result);
        }    
    }

    public bool PointInCircle(double latitude, double longitude)
    {
        Point point = new(latitude, longitude);
        foreach (string key in ThreeOneOneCircles.Keys)
        {   
            if  (ThreeOneOneCircles[key].Contains(point))
            {
                return true;
            }
        }
        return false;
    }
}

/// <summary>
/// Used in TinyCsvParser to map the columns from excel to C#
/// </summary>
public class CsvThreeOneOneMapping : CsvMapping<ThreeOneOneStreet>
{
    public CsvThreeOneOneMapping()
        : base()
    {
        MapProperty(0, x => x.UniqueKey);
        MapProperty(5, x => x.StreetName);
        MapProperty(6, x => x.Latitude);
        MapProperty(7, x => x.Longitude);
        MapProperty(9, x => x.ComplaintCategory);
        MapProperty(10, x => x.Severity);
    }
}

public class ThreeOneOneStreet
{
    public string StreetName { get; set; }
    public string ComplaintCategory { get; set; }
    public string Severity { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string UniqueKey { get; set; }

    public override string ToString()
    {
        return $"{StreetName}, {ComplaintCategory}, {Severity}, {Latitude}, {Longitude}";
    }
}

using NetTopologySuite.Geometries;
using TinyCsvParser;
using System.Text;
using TinyCsvParser.Mapping;


public class Parks
{
    public List<Park> ParksList { get; set; } = new List<Park>();
    public Parks(string csvParks)
    {
        CreateParksList(csvParks);
    }

    private void CreateParksList(string csvPath)
    {
        CsvParserOptions csvParserOptions = new CsvParserOptions(true,',');
        CsvParkMapping csvMapper = new CsvParkMapping();
        CsvParser<Park> csvParser = new CsvParser<Park>(csvParserOptions, csvMapper);

        // result is a list of results, each of which contain a street object
        var result = csvParser
            .ReadFromFile(csvPath, Encoding.UTF8)
            .ToList();

        foreach (var park in result)
        {
            ParksList.Add(park.Result);
        }
    }

    public bool ParkTrueFalse(double longitude, double latitude)
    {
        Point point = new Point(latitude, longitude);

        foreach (var park in ParksList)
        {
            if (park.ParkPolygon.Contains(point))
            {
                return true;
            }
        } 
        return false;
    }
}

public class CsvParkMapping : CsvMapping<Park>
{
    public CsvParkMapping()
        : base()
    {
        MapProperty(0, x => x.ParkName);
        MapProperty(1, x => x.ParkPolygon, new WKTToGeometryConverter());
    }
}
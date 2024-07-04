using System.Text;
using NetTopologySuite.Geometries;
using TinyCsvParser;

public class PedestrianData
{
    public List<Street> StreetsList {get;} = [];

    public PedestrianData(string csvData)
    {
        CreateStreetsList(csvData);
    }

    private void CreateStreetsList(string csvPath)
    {
        CsvParserOptions csvParserOptions = new CsvParserOptions(false,';');
        CsvStreetMapping csvMapper = new CsvStreetMapping();
        CsvParser<Street> csvParser = new CsvParser<Street>(csvParserOptions, csvMapper);

        // result is a list of results, each of which contain a street object
        var result = csvParser
            .ReadFromFile(csvPath, Encoding.UTF8)
            .ToList();

        foreach (var street in result)
        {
            StreetsList.Add(street.Result);
        }
    }

    public int ClosestRoadRank(double longitude, double latitude)
    {
        double minDist = double.MaxValue;
        int rank = int.MaxValue;
        Point point = new Point(latitude, longitude);

        foreach (var street in StreetsList)
        {
            var temp = street.MultiLineString.Distance(point);
            if (temp <= minDist) {minDist = temp; rank = street.Rank;}
        }
        return rank;
    }
}
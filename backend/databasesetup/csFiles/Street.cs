
using NetTopologySuite.Geometries;
using TinyCsvParser.Mapping;

/// <summary>
/// Used in PedestrianData to store the data from the CSV
/// </summary>
/// <param name="multiLineString"></param>
/// <param name="rank"></param> <summary>
/// </summary>
public class Street
{
    public Geometry? MultiLineString { get; set; } 
    public int Rank { get; set; } 
    public string? StreetName { get; set; }

    public override string ToString()
    {
        return $"STRING PRINT: {MultiLineString.ToString()}, {StreetName}, {Rank.ToString()}";
    }
}


/// <summary>
/// Used in TinyCsvParser to map the columns from excel to C#
/// </summary>
public class CsvStreetMapping : CsvMapping<Street>
{
    public CsvStreetMapping()
        : base()
    {
        MapProperty(0, x => x.MultiLineString, new WKTToGeometryConverter());
        MapProperty(1, x => x.StreetName);
        MapProperty(2, x => x.Rank);
    }
}
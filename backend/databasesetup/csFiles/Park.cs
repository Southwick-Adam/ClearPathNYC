using NetTopologySuite.Geometries;

public class Park
{
    public Geometry ParkPolygon {get; set;}
    public string ParkName {get; set;}
    public override string ToString()
    {
        return $"{ParkName}, {ParkPolygon}";
    }
}
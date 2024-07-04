using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using TinyCsvParser.TypeConverter;

public class WKTToGeometryConverter : ITypeConverter<Geometry>
{
    private readonly WKTReader _reader = new WKTReader();

    public Type TargetType => throw new NotImplementedException();

    public bool TryConvert(string value, out Geometry result)
    {
        result = _reader.Read(value);
        return true;
    }
}
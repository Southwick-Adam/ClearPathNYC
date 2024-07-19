using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.Geometries.Utilities;

class TaxiZones
{
    Dictionary<int, Geometry> TaxiDict = [];
    NetTopologySuite.IO.GeoJsonReader reader = new();
    public TaxiZones(string taxiData)
    {
        TaxiDict = ParseGeoShapes(taxiData);
    }

    // https://stackoverflow.com/questions/58609043/mapping-geojson-feature-to-a-property


    /// <summary>
    /// Used for parsing GeoJSON data and outputting a dictionary of the Id: shape
    /// </summary>
    /// <param name="data">GeoJSON file as string</param>
    /// <returns></returns>
    public Dictionary<int, Geometry> ParseGeoShapes(string data)
        {
            var featureCollection = reader.Read<FeatureCollection>(data);

            foreach (var feature in featureCollection)
            {
                try
                {
                    int? locationIDStr = int.Parse(feature.Attributes["location_id"].ToString());
                    // first feature ensures only Manhattan are saved, 
                    // second screens out Governors, Ellis and Librerty Island
                    if (feature.Attributes["borough"].Equals("Manhattan") 
                    && locationIDStr != 103)
                    {
                        var geometry = Extract(feature).FirstOrDefault();
                        if (geometry != null)
                        {
                            TaxiDict.Add(int.Parse(feature.Attributes["location_id"].ToString()), geometry);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
            }
            return TaxiDict;
        }

        public IEnumerable<Geometry> Extract(IFeature feature)
        {
            var extract = new List<Geometry>();

            new GeometryExtracter<Point>(extract).Filter(feature.Geometry);
            new GeometryExtracter<MultiPoint>(extract).Filter(feature.Geometry);
            new GeometryExtracter<LineString>(extract).Filter(feature.Geometry);
            new GeometryExtracter<MultiLineString>(extract).Filter(feature.Geometry);
            new GeometryExtracter<LinearRing>(extract).Filter(feature.Geometry);
            new GeometryExtracter<Polygon>(extract).Filter(feature.Geometry);
            new GeometryExtracter<MultiPolygon>(extract).Filter(feature.Geometry);

            return extract;
        }


    /// <summary>
    /// Used to check if a coordinate set is in a shape 
    /// </summary>
    /// <param name="lat"></param>
    /// <param name="longitude"></param>
    /// <returns>boolean</returns>
    public int PointInTaxiZone(double longitude, double lat)
    {
        Point point = new(lat, longitude);
        foreach (int key in TaxiDict.Keys)
        {
            if  (TaxiDict[key].Contains(point))
            {
                return key;
            }
        }
        return -1;
    }
}

using OsmSharp;
using OsmSharp.Streams;
using NetTopologySuite.Features;
using NetTopologySuite.Geometries;
using NetTopologySuite.Geometries.Utilities;
using NetTopologySuite.IO;

class CreateDatabase
{
    private string uri = "bolt://localhost:7687";
    private string user = "neo4j";
    private string password = "password";
    private TaxiZones taxiZones;
    private MetroStops metroStops;
    private PedestrianData pedestrianData;
    private Parks parks;
    private ThreeOneOne threeOneOne;
    private Polygon polygon;
    public CreateDatabase(string taxiData, string metroData, string pedestrianCsv, string csvParks, string csvThreeOneOne)
    {
        taxiZones = new TaxiZones(taxiData);
        metroStops = new MetroStops(metroData);
        pedestrianData = new PedestrianData(pedestrianCsv);
        parks = new Parks(csvParks);
        threeOneOne = new ThreeOneOne(csvThreeOneOne);
        var reader = new GeoJsonReader();
        try
        {
            using (var streamReader = new StreamReader("island.txt"))
            {
                string geoJson = streamReader.ReadToEnd();
                var featureCollection = reader.Read<FeatureCollection>(geoJson);
                var feature = featureCollection[0];
                polygon = feature.Geometry as Polygon;

                if (polygon == null)
                {
                    throw new InvalidOperationException("The geometry in the provided GeoJSON is not a polygon.");
                }
            }
        }
        catch (FileNotFoundException ex)
        {
            Console.WriteLine($"Error: The file 'island.txt' was not found. {ex.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading GeoJSON file: {ex.Message}");
            // Handle the error as needed
        }
    }
    
    /// <summary>
    /// Used to get a dictionary of all roads that are pedestrian accessible in the osm.pbf file
    /// </summary>
    /// <param name="filePath">Path to the file in osm.pbf format </param>
    /// <returns>Dictionary long:MapNode</returns>
    public async Task AddMapArea(string filePath, List<double> mapArea)
    {
        Neo4jImplementation neo4JImplementation = new Neo4jImplementation(uri, user, password);

        // dictionary of the MapNodes for faster lookup on loops
        Dictionary<long, MapNode> nodeTable = [];

        // list of the ways and Nodes
        List<Way> ways = new List<Way>();
        List<Node> nodesToProcess = new List<Node>();

        int zeroLatLongCounter = 0;
        int populatedLatLongCounter =0;

        // Open the OSM PBF file for reading
        using (var fileStream = File.OpenRead(filePath))
        {
            // Initialize the PBF source
            var source = new PBFOsmStreamSource(fileStream);

            double left     = mapArea[0];
            double top      = mapArea[1];
            double right    = mapArea[2];
            double bottom   = mapArea[3];

            // used to filter to just the selected area 
            var filtered = source.FilterBox((float)left, (float)top, (float)right, (float)bottom); // left, top, right, bottom

            var ignoredTags = new List<string> {"freeway", "service", "motorway", "	elevator"};
            // Enumerate through the OSM data and display it
            foreach (var osmGeo in filtered)
            {
                if (osmGeo.Type == OsmGeoType.Way)
                {
                    var tempWay = osmGeo as Way;
                    if (tempWay != null)
                    {
                        foreach (var tag in tempWay.Tags)
                        {
                            if (tag.Key == "area" && tag.Value == "yes")
                            {
                                break;
                            }
                            if (tag.Key == "access" && tag.Value == "private")
                            {
                                break;
                            }
                            if (tag.Key == "highway" && !ignoredTags.Contains(tag.Value)) 
                            {
                                ways.Add(tempWay);
                                break;
                            }
                        }
                    }
                }
                else if (osmGeo.Type == OsmGeoType.Node)
                {
                    var tempNode = osmGeo as Node;
                    if (tempNode != null)
                    {
                        nodesToProcess.Add(tempNode);
                    }
                }
            }
        }
            
        Console.WriteLine("In loop 1");
        // loop 1 - through all the ways - adding nodes to use dictionary 
        foreach (var way in ways)
        {
            foreach (var node in way.Nodes)
            {
                if (!nodeTable.ContainsKey(node))
                {
                    nodeTable.Add(node, new MapNode(node));
                }
            } 
        }

        Console.WriteLine("In loop 2");
        // second loop: Loops through the Nodes and adds any used Nodes Coordinates - rewriting them in the dictionary
        foreach (var node in nodesToProcess)
        {

            if (node.Id != null && nodeTable.ContainsKey(node.Id.Value))
            {
                if (node.Longitude.HasValue && node.Latitude.HasValue)
                {
                    NetTopologySuite.Geometries.Point point = new(node.Longitude.Value, node.Latitude.Value);
                    if (!polygon.Contains(point))
                    {
                        Console.WriteLine($"Point not in, skipping {node.Latitude.Value}, {node.Longitude.Value}");
                        continue;
                    }

                    // populates the Node object and adds it to the database
                    MapNode tempNode = new MapNode(node.Id.Value, node.Latitude.Value, node.Longitude.Value);
                    int tempTaxiZone = taxiZones.PointInTaxiZone(node.Latitude.Value, node.Longitude.Value);
                    int tempMetroNearby = metroStops.NearestMetroStop(node.Latitude.Value, node.Longitude.Value);
                    int tempRoadRank = pedestrianData.ClosestRoadRank(node.Latitude.Value, node.Longitude.Value);
                    bool ParkTrueFalse = parks.ParkTrueFalse(node.Latitude.Value, node.Longitude.Value);
                    bool ThreeOneOneTrueFalse = threeOneOne.PointInCircle(node.Latitude.Value, node.Longitude.Value);

                    tempNode.TaxiZone = tempTaxiZone;
                    tempNode.MetroZones = tempMetroNearby;
                    tempNode.RoadRank = tempRoadRank;
                    tempNode.Park = ParkTrueFalse;
                    tempNode.ThreeOneOne = ThreeOneOneTrueFalse;
                    nodeTable[node.Id.Value] = tempNode;
                    await neo4JImplementation.AddNodeToDB(tempNode);
                }
            }
        }

        Console.WriteLine("In loop 3");
        // final loop: again looping through the Ways - adding links between Nodes
        foreach (var way in ways)
        {
            if (way.Tags != null)
            {
                foreach (var tag in way.Tags)
                {
                    if (tag.Key == "highway" && tag.Value != "freeway")
                    {
                        bool edge = true;
                        MapNode currMapNode;
                        MapNode? pastMapNode = null;

                        foreach (var point in way.Nodes)
                        {
                            try
                            {
                                currMapNode = (MapNode)nodeTable[point];

                                // used to check that the amount of nodes with no latitude or longitude assigned
                                if (currMapNode.Latitude == 0)
                                {
                                    zeroLatLongCounter += 1;
                                }
                                else
                                {
                                    populatedLatLongCounter += 1;
                                }
                                
                                if (edge==false){
#pragma warning disable CS8604 // Possible null reference argument.
                                    currMapNode.AddInfo(pastMapNode);
#pragma warning restore CS8604 // Possible null reference argument.
                                    await neo4JImplementation.AddNodeRelationships(currMapNode, pastMapNode);
                                    pastMapNode = currMapNode;

                                } else if (edge == true){
                                    pastMapNode = (MapNode)nodeTable[point];
                                    edge = false;
                                }
                            }
                            catch (KeyNotFoundException)
                            {
                                Console.WriteLine($"Node: {point} not found in the nodeTable.");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine(ex.ToString());
                            }
                            
                        }
                        break;
                    }
                }
            }
        }
        
        Console.WriteLine($"There are {zeroLatLongCounter} nodes with a latitude of 0.");
        Console.WriteLine($"There are {populatedLatLongCounter} nodes with a latitude that is populated.");
        Console.WriteLine(nodesToProcess.Count);
        Console.WriteLine(ways.Count);
        Console.WriteLine(nodeTable.Keys.Count);
        Console.WriteLine("Nodes created successfully: "+neo4JImplementation.Success);
        Console.WriteLine("Nodes not created successfully: "+neo4JImplementation.Failed);
        Console.WriteLine("Rels created successfully: "+neo4JImplementation.RelSuccess);
        Console.WriteLine("Rels not created successfully: "+neo4JImplementation.RelFailed);

    neo4JImplementation.Dispose();
    }
}



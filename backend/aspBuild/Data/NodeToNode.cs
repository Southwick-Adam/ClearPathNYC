using Neo4j.Driver;

namespace aspBuild.Data
{
    public class NodeToNode
    {
        public long NodeID { get; set; }
        public double Distance { get; set; }
        public byte Direction { get; set; }
        public long RelatedNodeID { get; set; }
        public int RelatedNodeRoadRank { get; set; }
        public string RelatedNodeMetroZone { get; set; }
        public bool RelatedNodeThreeOneOne { get; set; }
        public bool RelatedNodePark { get; set; }
    }

    public class NodeToNodeMapper
    {
        public NodeToNode Map(IRecord record)
        {
            return new NodeToNode
            {
                NodeID = record["n.nodeid"].As<long>(),
                Distance = record["r.distance"].As<double>(),
                Direction = record["r.direction"].As<byte>(),
                RelatedNodeID = record["relatedNodeId"].As<long>(),
                RelatedNodeRoadRank = record["relatedNodeRoadrank"].As<int>(),
                RelatedNodeMetroZone = record["relatedNodeMetrozone"].As<string>(),
                RelatedNodeThreeOneOne = record["relatedNodeThreeoneone"].As<bool>(),
                RelatedNodePark = record["relatedNodePark"].As<bool>()
            };
        }
    }
}
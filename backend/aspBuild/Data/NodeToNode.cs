using Neo4j.Driver;

namespace aspBuild.Data
{
    /// <summary>
    /// Contains the information for updating the Neo4j database
    /// </summary>
    // TODO: Test using Struct vs class in this at a larger scale
    public class NodeToNode
    {
        public long NodeID { get; set; }
        public double Distance { get; set; }
        public long RelatedNodeID { get; set; }
        public int RelatedNodeRoadRank { get; set; }
        public int RelatedNodeMetroZone { get; set; }
        public bool RelatedNodeThreeOneOne { get; set; }
        public bool RelatedNodePark { get; set; }
        public bool NodePark { get; set; }
    }

    public class NodeToNodeMapper
    {
        /// <summary>
        /// Maps an IRecord to NodeToNode object
        /// </summary>
        /// <param name="record"></param>
        /// <returns></returns>
        public NodeToNode Map(IRecord record)
        {
            return new NodeToNode
            {
                NodeID = record["n.nodeid"].As<long>(),
                Distance = record["r.distance"].As<double>(),
                RelatedNodeID = record["relatedNodeId"].As<long>(),
                RelatedNodeRoadRank = record["relatedNodeRoadrank"].As<int>(),
                RelatedNodeMetroZone = record["relatedNodeMetrozone"].As<int>(),
                RelatedNodeThreeOneOne = record["relatedNodeThreeoneone"].As<bool>(),
                RelatedNodePark = record["relatedNodePark"].As<bool>(),
                NodePark = record["nodePark"].As<bool>()
            };
        }
    }
}
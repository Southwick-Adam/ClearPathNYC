class NodeInfo(double distance, int quietScore)
{
    public double Distance { get; set; } = distance;
    public int QuietScore { get; set; } = quietScore;
    

    public override string ToString()
    {
        return $"distance: {this.Distance}, \n QuietScore: {this.QuietScore}";
    }
}


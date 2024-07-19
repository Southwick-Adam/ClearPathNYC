
class NodeInfo(double distance, byte direction, byte directionReverse, int quietScore)
{
    public double Distance { get; set; } = distance;
    public byte Direction { get; set; } = direction;
    public byte DirectionReverse { get; set; } = directionReverse;
    public int QuietScore { get; set; } = quietScore;
    

    public override string ToString()
    {
        return $"distance: {this.Distance},\nDirection: {this.Direction}, \n QuietScore: {this.QuietScore}";
    }
}


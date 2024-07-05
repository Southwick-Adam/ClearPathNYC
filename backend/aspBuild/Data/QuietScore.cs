

using Microsoft.Win32.SafeHandles;

namespace aspBuild.Data
{
    public class QuietScore
    {
        private double FinalQuietScore { get; set; }
        ParkNodes parkNodes;

        public QuietScore(string parkFilePath, string jsonTaxiPath, string jsonSubwayPath)
        {
            parkNodes = new ParkNodes(parkFilePath);

        }

        public async Task CalculateQuietScore(long nodeIDStart, long nodeIDDestination)
        {

        }



    }
}
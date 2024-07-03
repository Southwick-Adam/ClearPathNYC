using NetTopologySuite.Geometries;

public class ThreeOneOne
{
    public List<Geometry> ThreeOneOneList = [];

    public ThreeOneOne(string csvPath)
    {
        CreateThreeOneOneList(csvPath);
    }

    private void CreateThreeOneOneList(string csvPath)
    {
        using (var reader = new StreamReader(csvPath))
        {
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                var values = line.Split(",");
                Console.WriteLine(values);
                // try
                // {
                //     double longitude = Double.Parse(values[2]);
                // }
                // catch (Exception ex) 
                // {
                //     Console.WriteLine(ex.ToString());
                // }
                // var tempPoint = new Point(Double.Parse(values[1]), Double.Parse(values[2]));
                // var tempCircle = CreateCircleAndCheckPoints(Double.Parse(values[2]), Double.Parse(values[1]));
                // closestMetroDict.Add(values[0],tempPoint);
                // MetroDict.Add(values[0], tempCircle);
            }
        }
    }
}


namespace aspBuild.Data
{
    public class ParkNodes
    {
    public List<long> ParkNodeList = new List<long>();

    public ParkNodes(string filePath)
    {
        CreateParkNodes(filePath);
    }

    private void CreateParkNodes(string filePath)
    {
        try
            {
                using (StreamReader readText = new StreamReader(filePath))
                {
                    string line;
#pragma warning disable CS8600 // Converting null literal or possible null value to non-nullable type.
                    while ((line = readText.ReadLine()) != null)
                    {
                        if (long.TryParse(line, out long number))
                        {
                            ParkNodeList.Add(number);
                        }
                        else
                        {
                            Console.WriteLine($"Invalid number format: {line}");
                        }
                    }
#pragma warning restore CS8600 // Converting null literal or possible null value to non-nullable type.
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
        }



    }

    
}
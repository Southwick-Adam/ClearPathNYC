

namespace aspBuild.Data
{
    public class ParkNodes
    {
        public List<long> ParkNodeList;

        // Imports and sorts the List of parks
        public ParkNodes(string filePath)
        {
            ParkNodeList = [];
            CreateParkNodes(filePath);
            if (!CheckSortedList()) ParkNodeList.Sort();
            Console.WriteLine($"ParkNode - CheckSortedList: {CheckSortedList()}");
        }

        private void CreateParkNodes(string filePath)
        {
            try
                {
                    using (StreamReader readText = new(filePath))
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


        private bool CheckSortedList()
        {
            for (int i = 1; i < ParkNodeList.Count; i++)
            {
                if (ParkNodeList[i] < ParkNodeList[i - 1])
                {
                    return false;
                }
            }
            return true;
        }   
        

        public bool CheckIfPark(long nodeID)
        {
            if (ParkNodeList.Contains(nodeID))
            {return true;}
            else{return false;}
        }

        
        public bool BinaryCheckIfPark(long nodeID)
        {
            int left = 0;
            int right = ParkNodeList.Count-1;

            while( left <= right)
            {
                int midpoint = left + (right - left) / 2;
                if (ParkNodeList[midpoint] == nodeID)
                {
                    return true;
                }
                else if (ParkNodeList[midpoint] < nodeID)
                {
                    left = midpoint + 1;
                }
                else
                {
                    right = midpoint - 1;
                }
            }
            return false;
        }
    }
}
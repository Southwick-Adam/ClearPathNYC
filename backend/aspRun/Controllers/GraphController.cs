using Microsoft.AspNetCore.Mvc;
using aspRun.Data;

namespace aspRun.Controllers
{
    [Route("graph")]
    [ApiController]
    public class GraphController(ChangeDb _changeDb) : Controller
    {
        [HttpPost]
        public async Task TriggerChangeDB()
        {
            await _changeDb.Change();
        }
    }
}

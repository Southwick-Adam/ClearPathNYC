using aspBuild.Data;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class UpdateController : ControllerBase
{
    private readonly UpdateDatabase _updateDatabase;

    public UpdateController(UpdateDatabase updateDatabase)
    {
        _updateDatabase = updateDatabase;
    }

    [HttpPost("ImmediateUpdate")]
    public async Task<IActionResult> ImmediateUpdate()
    {
        await _updateDatabase.UpdateTheDatabase();
        return Ok("Immediate update completed.");
    }
}

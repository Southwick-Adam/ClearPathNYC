using Microsoft.AspNetCore.Mvc;
using aspRun.ApiCalls;

namespace aspRun.Controllers
{
    [Route("weather")]
    [ApiController]
    public class WeatherController(WeatherAPI weatherAPI) : Controller
    {
        private readonly WeatherAPI _weatherAPI = weatherAPI;

        [HttpGet]
        public Task<IActionResult> WeatherResult()
        {
            var weather = _weatherAPI.WeatherResult();
            return Task.FromResult<IActionResult>(Ok(weather));
        }

    }

}

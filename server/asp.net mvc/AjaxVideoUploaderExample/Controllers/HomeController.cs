using System.Web.Mvc;

namespace AjaxVideoUploaderExample.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Upload()
        {
            return new EmptyResult();
        }
    }
}
using System.Web;
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

        [HttpPost]
        public ActionResult Upload()
        {
            HttpPostedFileBase file = Request.Files[0];
            bool hasFile =  file != null && file.InputStream != null && file.ContentLength != 0;

            if (hasFile)
            {
                //Here the file should be saved to any temporary storage.
                //E.g. file system or Azure blob storage

                string uploaded = "http://yourpathtofile.com/file";

                var response = new
                {
                    status = "success",
                    url = uploaded,
                    filename = uploaded
                };

                return new JsonResult()
                {
                    Data = response,
                };
            }


            return new JsonResult
            {
                Data = new
                {
                    status = "error",
                    error = "Reason what happened"
                }
            };
        }
    }
}
package controllers;

import play.mvc.Controller;
import play.mvc.Result;
import views.html.main;

public class IndexController extends Controller {

    public Result index() {
        return ok(main.render("Ws"));
    }

}

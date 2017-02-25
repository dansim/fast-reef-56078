package controllers;

import akka.actor.ActorSystem;
import akka.stream.Materializer;
import play.libs.streams.ActorFlow;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import services.ClientActor;
import services.GameState;
import views.html.main;

import javax.inject.Inject;
import javax.inject.Singleton;

@Singleton
public class IndexController extends Controller {

    private final ActorSystem actorSystem;
    private final Materializer materializer;
    private final GameState gameState;

    @Inject
    public IndexController(final ActorSystem actorSystem, final Materializer materializer, final GameState gameState) {
        this.actorSystem = actorSystem;
        this.materializer = materializer;
        this.gameState = gameState;
    }

    public Result index() {
        return ok(main.render("Ws"));
    }

    public Result reset() {
        return redirect("/");
    }

    public WebSocket socket() {
        return WebSocket.Text.accept(request -> ActorFlow.actorRef(
                (out) -> ClientActor.props(
                        out,
                        request.cookies().get("id").value(),
                        gameState),
                actorSystem,
                materializer));
    }

}

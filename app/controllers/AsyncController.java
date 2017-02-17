package controllers;

import play.libs.streams.ActorFlow;
import akka.stream.*;
import akka.actor.*;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import scala.Function1;
import services.ClientActor;
import services.Clients;

import javax.inject.Inject;
import javax.inject.Singleton;

@Singleton
public class AsyncController extends Controller {

    private final ActorSystem actorSystem;
    private final Materializer materializer;

    private final Clients clients;

    @Inject
    public AsyncController(final ActorSystem actorSystem, final Materializer materializer, final Clients clients) {
        this.actorSystem = actorSystem;
        this.materializer = materializer;
        this.clients = clients;
    }

    public Result reset() {
        return redirect("/");
    }

    public WebSocket socket() {
        final WebSocket ws = WebSocket.Text.accept(request -> ActorFlow.actorRef(
                        (out) -> ClientActor.props(
                                out,
                                request.cookies().get("clientId").value(),
                                clients.register(out)),
                        actorSystem,
                        materializer));

        return ws;
    }

}

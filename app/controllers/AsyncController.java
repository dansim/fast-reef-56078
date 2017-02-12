package controllers;

import akka.stream.javadsl.Flow;
import com.fasterxml.jackson.databind.ObjectMapper;
import play.Application;
import play.Logger;
import play.libs.Json;
import play.mvc.Controller;
import play.mvc.Result;
import play.mvc.WebSocket;
import services.Clients;
import services.MousePoint;
import javax.inject.Inject;
import javax.inject.Singleton;

@Singleton
public class AsyncController extends Controller {

    private final Clients clients;

    @Inject
    public AsyncController(final Clients clients) {
        this.clients = clients;
    }

    public Result reset() {
        clients.resetOld();
        return redirect("/");
    }

    public WebSocket socket() {
        return WebSocket.Text.accept(request -> {
            final String userId = request.cookies().get("clientId").value();
            return Flow.<String>create().map((msg) -> {
                final MousePoint mousePoint = new ObjectMapper().readValue(msg, MousePoint.class);
                clients.updateClient(userId, mousePoint);
                return Json.toJson(clients).toString();
            });
        });
    }

}

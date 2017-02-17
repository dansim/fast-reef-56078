package services;


import akka.actor.ActorRef;
import akka.actor.Props;
import akka.actor.UntypedActor;
import com.fasterxml.jackson.databind.ObjectMapper;
import play.libs.Json;

import java.util.Objects;

public class ClientActor extends UntypedActor {

    public static Props props(final ActorRef out, final String userId, final Clients clients) {
        return Props.create(ClientActor.class, out, userId, clients);
    }

    private final ActorRef out;
    private final String userId;
    private final Clients clients;

    public ClientActor(final ActorRef out, final String userId, final Clients clients) {
        this.out = out;
        this.userId = userId;
        this.clients = clients;
    }

    @Override
    public void onReceive(Object message) throws Exception {
        if(message instanceof String) {
            out.tell(Json.toJson(clients).toString(), self());
            final MousePoint mousePoint = new ObjectMapper()
                    .readValue(message.toString(), MousePoint.class);
            clients.updateClient(userId, mousePoint);
            out.tell(Json.toJson(clients).toString(), self());
        }
    }
}

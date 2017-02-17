package services;

import akka.actor.ActorRef;
import akka.http.impl.model.parser.HeaderParser;
import akka.http.scaladsl.model.headers.RequestHeader;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Singleton;
import play.Logger;
import play.libs.Json;
import play.mvc.Http;
import play.mvc.WebSocket;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Singleton
public class Clients {

    private final ConcurrentMap<String, MousePoint> clients = new ConcurrentHashMap<>();

    private final List<ActorRef> clientRefs = new ArrayList<>();

    @JsonProperty("clients")
    public final Vector<MousePoint> data = new Vector<>();

    void updateClient(final String client, final MousePoint position) {
        if(Objects.isNull(clients.get(client))) {
            clients.put(client, position
                    .withClientId(client)
                    .withCreated(LocalDateTime.now())
                    .withLastUpdated(LocalDateTime.now())
            );
        } else {
            clients.replace(client, clients.get(client), position.withClientId(client));
        }
        data.clear();
        data.addAll(clients.values());

        broadcast();
    }

    public Clients register(final ActorRef out) {
        clientRefs.add(out);
        return this;
    }

    private void broadcast() {
        clientRefs.forEach(actorRef -> actorRef.tell(Json.toJson(this).toString(), ActorRef.noSender()));
    }

}

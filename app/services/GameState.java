package services;

import akka.actor.ActorRef;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Singleton;
import domain.ClientState;
import domain.ClientStateUpdate;
import play.libs.Json;

import java.util.*;

@Singleton
public class GameState {

    @JsonProperty("clients")
    private Vector<ClientState> clientStates;

    private final List<ActorRef> clientRefs = new ArrayList<>();

    public Vector<ClientState> clientStates() {
        if(Objects.isNull(clientStates)) {
            clientStates = new Vector<>();
        }
        return clientStates;
    }

    void updateClient(final ClientStateUpdate update) {
        final Optional<ClientState> existing = clientStates().stream()
                .filter(clientState -> clientState.id.equals(update.id))
                .findFirst();

        if(existing.isPresent()) {
            existing.get().update(update);
        } else {
            clientStates().add(new ClientState(update));
        }
    }

    GameState register(final ActorRef out) {
        clientRefs.add(out);
        return this;
    }

    void broadcast() {
        clientRefs.forEach(actorRef -> actorRef.tell(Json.toJson(this).toString(), ActorRef.noSender()));
    }

    void deRegister(final ActorRef out) {
        clientRefs.stream()
                .filter(actorRef -> actorRef.equals(out))
                .findFirst()
                .ifPresent(clientRefs::remove);
    }

}

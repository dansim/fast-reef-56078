package services;

import akka.actor.ActorRef;
import akka.actor.Props;
import akka.actor.UntypedActor;
import com.fasterxml.jackson.databind.ObjectMapper;
import domain.ClientStateUpdate;

public class ClientActor extends UntypedActor {

    public static Props props(final ActorRef out, final String userId, final GameState gameState) {
        return Props.create(ClientActor.class, out, userId, gameState);
    }

    private final ActorRef out;
    private final String userId;
    private final GameState gameState;

    public ClientActor(final ActorRef out, final String userId, final GameState gameState) {
        this.out = out;
        this.userId = userId;
        this.gameState = gameState.register(out);
    }

    @Override
    public void onReceive(Object message) throws Exception {
        if(message instanceof String) {
            final ClientStateUpdate update = new ObjectMapper()
                    .readValue(message.toString(), ClientStateUpdate.class);
            gameState.updateClient(update.byClient(userId).x(update.x).y(update.y));
            gameState.broadcast();
        }
    }

    @Override
    public void postStop() throws Exception {
        super.postStop();
        gameState.deRegister(out);
    }

}

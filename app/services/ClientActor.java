package services;


import akka.actor.ActorRef;
import akka.actor.Props;
import akka.actor.UntypedActor;
import com.fasterxml.jackson.databind.ObjectMapper;

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
        this.clients = clients.register(out);
    }

    @Override
    public void onReceive(Object message) throws Exception {
        if(message instanceof String) {
            final ClientStateUpdate update = new ObjectMapper()
                    .readValue(message.toString(), ClientStateUpdate.class);
            clients.updateClient(update.byClient(userId).x(update.x).y(update.y));
            clients.broadcast();
        }
    }

    @Override
    public void postStop() throws Exception {
        super.postStop();
        clients.deRegister(out);
    }

}

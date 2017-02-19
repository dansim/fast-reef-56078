package services;

import java.time.LocalDateTime;

public class ClientState {

    public Float clientX;
    public Float clientY;
    public String clientId;
    public LocalDateTime created;
    public LocalDateTime updated;

    ClientState(final ClientStateUpdate update) {
        this.clientId = update.clientId;
        this.clientX = update.x;
        this.clientY = update.y;
        this.created = LocalDateTime.now();
        this.updated = LocalDateTime.now();
    }

    void update(final ClientStateUpdate update) {
        if(update.clientId.equals(clientId)) {
            this.clientX = update.x;
            this.clientY = update.y;
            this.updated = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Client trying to update with wrong clientId!");
        }
    }

}

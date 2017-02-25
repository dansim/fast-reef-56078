package domain;

import java.time.LocalDateTime;

public class ClientState {

    public String id;
    public Float x;
    public Float y;
    public Float alpha;
    public LocalDateTime created;
    public LocalDateTime updated;

    public ClientState(final ClientStateUpdate update) {
        this.id = update.id;
        this.x = update.x;
        this.y = update.y;
        this.alpha = update.alpha;
        this.created = LocalDateTime.now();
        this.updated = LocalDateTime.now();
    }

    public void update(final ClientStateUpdate update) {
        if(update.id.equals(id)) {
            this.x = update.x;
            this.y = update.y;
            this.alpha = update.alpha;
            this.updated = LocalDateTime.now();
        } else {
            throw new IllegalStateException("Client trying to update with wrong id!");
        }
    }
}

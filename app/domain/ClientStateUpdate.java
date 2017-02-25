package domain;

import java.util.Objects;

public class ClientStateUpdate {

    public String id;
    public Float x;
    public Float y;
    public Float alpha;
    public Boolean moving;

    public ClientStateUpdate byClient(final String userId) {
        this.id = Objects.requireNonNull(userId);
        return this;
    }

    public ClientStateUpdate x(final Float x) {
        this.x = Objects.requireNonNull(x);
        return this;
    }

    public ClientStateUpdate y(final Float y) {
        this.y = Objects.requireNonNull(y);
        return this;
    }

}

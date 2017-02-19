package services;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

public class ClientStateUpdate {

    public String clientId;
    @JsonProperty("clientX")
    public float x;
    @JsonProperty("clientY")
    public float y;

    public ClientStateUpdate byClient(final String userId) {
        this.clientId = Objects.requireNonNull(userId);
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

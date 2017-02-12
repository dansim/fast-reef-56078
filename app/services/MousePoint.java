package services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class MousePoint {

    public Float clientX;
    public Float clientY;

    public String clientId;
    public LocalDateTime created;
    public LocalDateTime updated;

    MousePoint withClientId(String clientId) {
        this.clientId = clientId;
        return this;
    }

    @JsonIgnore
    public MousePoint withCreated(final LocalDateTime created) {
        this.created = created;
        return this;
    }

    @JsonIgnore
    public MousePoint withLastUpdated(final LocalDateTime updated) {
        this.updated = updated;
        return this;
    }
}

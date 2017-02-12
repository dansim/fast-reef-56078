package services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.inject.Singleton;
import play.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Vector;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Singleton
public class Clients {

    @JsonIgnore
    private final ConcurrentMap<String, MousePoint> clients = new ConcurrentHashMap<>();

    @JsonProperty("clients")
    public Vector<MousePoint> data = new Vector<>();

    private volatile int updateCount;
    private volatile boolean cleaning;

    public void updateClient(final String client, final MousePoint position) {
        if(!cleaning) {
            if(updateCount == 100) {
                resetOld();
                updateCount = 0;
            } else {
                updateCount += 1;
            }
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
        }
    }

    public String toString() {
        return clients.values().toString();
    }

    public void resetOld() {
        try {
            cleaning = true;
            Logger.info("Finding candidates to remove");
            final List<MousePoint> toBeRemoved = data.stream()
                    .filter(d -> Objects.nonNull(d.updated))
                    .filter(d -> Objects.nonNull(d.clientId))
                    .filter(d -> d.updated.isBefore(LocalDateTime.now().minusMinutes(1)))
                    .collect(Collectors.toList());

            Logger.info("Removing from view list");
            data.removeAll(toBeRemoved);
            Logger.info("Removing from internal list");
            toBeRemoved.stream().map(d -> d.clientId).forEach(clients::remove);
            Logger.info("Removed " + toBeRemoved.size() + " inactive clients.");
        } finally {
            cleaning = false;
        }
    }
}

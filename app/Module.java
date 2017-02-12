import com.google.inject.AbstractModule;
import services.*;

public class Module extends AbstractModule {

    @Override
    public void configure() {
        bind(Clients.class)
                .asEagerSingleton();
    }

}

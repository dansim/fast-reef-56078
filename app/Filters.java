import javax.inject.*;
import play.*;
import play.mvc.EssentialFilter;
import play.http.HttpFilters;


@Singleton
public class Filters implements HttpFilters {

    private final Environment env;

    @Inject
    public Filters(Environment env) {
        this.env = env;
    }

    @Override
    public EssentialFilter[] filters() {
      if (env.mode().equals(Mode.DEV)) {
          return new EssentialFilter[] {};
      } else {
         return new EssentialFilter[] {};
      }
    }
}

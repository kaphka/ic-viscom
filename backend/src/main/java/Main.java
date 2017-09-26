
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import org.sql2o.Sql2o;
import org.sql2o.quirks.PostgresQuirks;

import com.beust.jcommander.JCommander;
import com.google.gson.Gson;

import dao.Model;
import dao.Sql2oModel;
import spark.ModelAndView;
import spark.Request;
import spark.Spark;
import spark.template.mustache.MustacheTemplateEngine;
import util.CommandLineOptions;

public class Main {

	private static final Logger logger = Logger.getLogger(Main.class.getCanonicalName());

	public static String render(Map<String, Object> model, String templatePath) {
		return new MustacheTemplateEngine().render(new ModelAndView(model, templatePath));
	}

	public static void main(String[] args) {
		CommandLineOptions options = new CommandLineOptions();
		new JCommander(options, args);

		logger.finest("Options.debug = " + options.debug);
		logger.finest("Options.database = " + options.database);
		logger.finest("Options.dbHost = " + options.dbHost);
		logger.finest("Options.dbUsername = " + options.dbUsername);
		logger.finest("Options.dbPort = " + options.dbPort);
		logger.finest("Options.servicePort = " + options.servicePort);

		// Spark.port(options.servicePort);
		ProcessBuilder process = new ProcessBuilder();
		String dbUrl = System.getenv("DATABASE_URL");
		Integer port;
		Sql2o sql2o = null; 
		
		if (process.environment().get("PORT") != null && dbUrl != null && !dbUrl.isEmpty()) {
			port = Integer.parseInt(process.environment().get("PORT"));
			URI dbUri;
			try {
				dbUri = new URI(dbUrl);
				String username = dbUri.getUserInfo().split(":")[0];
				String password = dbUri.getUserInfo().split(":")[1];
				dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();
				sql2o = new Sql2o(dbUrl, username, password);
				logger.fine("connected to heroku db");
			} catch (URISyntaxException e) {
				e.printStackTrace();
			}
		} else {
			sql2o = new Sql2o("jdbc:postgresql://" + options.dbHost + ":" + options.dbPort + "/" + options.database,
					options.dbUsername, options.dbPassword, new PostgresQuirks());
			port = 4567;
		}
		System.out.println("Port: " + port);
		Spark.port(port);
//		 Spark.staticFileLocation("/public");
		Spark.externalStaticFileLocation("/home/jakob/htw/ic-viscom/frontend/dist");

		Model model = new Sql2oModel(sql2o);
		Gson gson = new Gson();

		Spark.get("/name", (req, res) -> {
			Map<String, Object> map = new HashMap();
			map.put("name", "Sam");
			return render(map, "frontpage.mustache");
		});

		Spark.get("/comments/:link_id", (request, response) -> {
			String link_id = request.params("link_id");
			// Test id;
			try {
				Integer.parseUnsignedInt(link_id, 36);
			} catch (NumberFormatException e) {
				response.status(404);
				return "";
			}
			if (shouldReturnHtml(request)) {
				Map<String, Object> map = new HashMap();
				map.put("linkid", link_id);
				return render(map, "thread.mustache");
			} else {
				response.type("application/json");
				logger.fine("get= " + link_id);
				response.status(200);
				return model.getComments("t3_" + link_id);
			}
		});

		Spark.get("/:author/comments", (request, response) -> {
			String author = request.params("author");
			// TODO: clean up
			logger.fine("get= " + author);
			response.status(200);
			response.type("application/json");
			return model.getCommentsByAuthor(author);
		});

		Spark.get("submissions/:id", (request, response) -> {
			String id = request.params("id");
			// TODO: clean up
			logger.fine("get= " + id);
			response.status(200);
			response.type("application/json");
			return model.getSubmissionData(id);
		});

		Spark.after((request, response) -> {
			response.header("Content-Encoding", "gzip");
			// response.header("Access-Control-Allow-Origin", "*");
		});
	}

	private static boolean shouldReturnHtml(Request request) {
		String accept = request.headers("Accept");
		return accept != null && accept.contains("text/html");
	}
}
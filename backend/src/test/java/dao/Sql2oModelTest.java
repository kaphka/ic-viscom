package dao;

import static org.junit.Assert.*;

import java.util.UUID;

import org.junit.After;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.sql2o.Sql2o;
import org.sql2o.converters.UUIDConverter;
import org.sql2o.quirks.PostgresQuirks;

import com.beust.jcommander.JCommander;

import util.CommandLineOptions;

public class Sql2oModelTest {

	@BeforeClass
	public static void setUpBeforeClass() throws Exception {
		CommandLineOptions options = new CommandLineOptions();
		new JCommander(options);
		Sql2o sql2o = new Sql2o("jdbc:postgresql://" + options.dbHost + ":" + options.dbPort + "/" + options.database,
				options.dbUsername, options.dbPassword, new PostgresQuirks() {
					{
						// make sure we use default UUID converter.
						converters.put(UUID.class, new UUIDConverter());
					}
				});
	}

	@Before
	public void setUp() throws Exception {
	}

	@After
	public void tearDown() throws Exception {
	}



}

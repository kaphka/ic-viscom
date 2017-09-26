package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class TestDBCreator {

	public TestDBCreator() {

	}

	private void insertToDB() {

	}

	public static void main(String[] args) throws SQLException {
		String url = "jdbc:postgresql://localhost/reddit";
		Properties props = new Properties();
		props.setProperty("user", "icdev");
		props.setProperty("password", "icdevpw");
		Connection conn = DriverManager.getConnection(url, props);
		System.out.println("Connected");
		conn.close();
	}

}

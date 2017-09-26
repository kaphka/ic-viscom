package dao;

import java.util.List;

import org.sql2o.Connection;
import org.sql2o.Sql2o;

public class Sql2oModel implements Model{
	
	private Sql2o sql2o;
	
	public Sql2oModel(Sql2o sql2o) {
		this.sql2o = sql2o;
	}

	@Override
	public List<KeyValue> getComments(String linkId) {
		try (Connection conn = sql2o.open()){
//			conn.createQuery("select * from comments where data->>'link_id' = ':linkId'")
//			.addParameter("link_id", linkId);
			return conn.createQuery("select * from comments where data->>'link_id' = :linkId")
					.addParameter("linkId", linkId)
					.executeAndFetch(KeyValue.class);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			throw e;
		}
	}

	@Override
	public List<Comment> getCommentsByAuthor(String author) {
		try (Connection conn = sql2o.open()){
			return conn.createQuery("select data from comments where data->>'author' = :author")
					.addParameter("author", author)
					.executeAndFetch(Comment.class);
		} 
	}

	@Override
	public String getSubmissionData(String id) {
		try (Connection conn = sql2o.open()){
			return conn.createQuery("select * from submissions where id =:id")
					.addParameter("id", id)
					.executeAndFetch(Submission.class).get(0).data;
		} 
	}

}

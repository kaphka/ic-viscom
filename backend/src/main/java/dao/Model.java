package dao;

import java.util.List;

public interface Model {
	List<KeyValue> getComments(String link_id);

	List getCommentsByAuthor(String author);

	String getSubmissionData(String id);
}

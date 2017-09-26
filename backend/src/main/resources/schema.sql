
drop table comments;
create table comments (
 id serial primary key, 
 comment_id VARCHAR(32),
 name VARCHAR(64), 
 body text, 
 gilded int, 
 score int, 
 ups int, 
 created_utc BIGINT,
 parent_id varchar(32), 
 url VARCHAR(255), 
 subreddit varchar(64)
 );
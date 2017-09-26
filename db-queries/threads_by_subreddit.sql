select 
	data->>'link_id' as id, count(id) as n
from 
	comments 
where 
	data->>'subreddit' = 'dataisbeautiful'  
group by 
	(data->>'link_id') 
order by n desc
limit 10
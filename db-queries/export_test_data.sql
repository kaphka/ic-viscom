COPY (select * from comments where data->>'link_id'='t3_425zk4') TO 'test_export.csv' (format CSV);

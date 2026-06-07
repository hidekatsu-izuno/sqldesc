create table stale (
  id int
);

create table analytics.events (
  id int
);

create view stale_view as select id from stale;

drop table stale;
drop view stale_view;
alter schema analytics rename to archive;

create view event_ids as select id from archive.events;

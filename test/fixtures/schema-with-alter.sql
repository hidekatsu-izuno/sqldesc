create table accounts (
  id int,
  age int,
  name text
);

alter table accounts add column email text;
alter table accounts alter column age type bigint;
alter table accounts rename column name to full_name;

create synonym account_syn for accounts;
create view account_view as select id, age, full_name, email from account_syn;

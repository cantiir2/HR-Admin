-- public.tb_m_user_role definition
-- Drop table
-- DROP TABLE public.tb_m_user_role;

create table public.tb_m_user_role ( user_name varchar(50) not null,
role_id int8 not null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_user_role_pkey primary key (user_name,
role_id));

insert
    into
    public.tb_m_user_role (user_name,
    role_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values('admin@hr.com', 1, 'system', '2026-08-11 04:15:49.568', null, null);
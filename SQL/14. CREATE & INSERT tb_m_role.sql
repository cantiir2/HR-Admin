-- public.tb_m_role definition
-- Drop table
-- DROP TABLE public.tb_m_role;

create table public.tb_m_role ( id bigserial not null,
"name" varchar(50) not null,
description varchar(200) null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
is_active bool default true null,
constraint tb_m_role_pkey primary key (id));

-- public.tb_m_role_id_seq definition
-- DROP SEQUENCE public.tb_m_role_id_seq;

CREATE SEQUENCE public.tb_m_role_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


insert
    into
    public.tb_m_role (id,
    "name",
    description,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    is_active)
values(1, 'System Administrator', 'Full access to all system features and user management', 'system', '2026-08-10 05:01:05.100', null, null, true);

insert
    into
    public.tb_m_role (id,
    "name",
    description,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    is_active)
values(2, 'HR Administrator', 'Access to User Management and Time & Attendance features', 'system', '2026-08-10 05:01:05.103', null, null, true);

insert
    into
    public.tb_m_role (id,
    "name",
    description,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    is_active)
values(3, 'PM', 'Project Manager role with project management and leave approval access', 'system', '2026-08-10 05:01:05.104', null, null, true);

insert
    into
    public.tb_m_role (id,
    "name",
    description,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    is_active)
values(4, 'STAFF', 'Staff / Employee role for attendance, leave, working report, and personal projects', 'system', '2026-08-10 05:01:05.106', null, null, true);

SELECT setval('public.tb_m_role_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_role), 1));


-- public.tb_m_application definition
-- Drop table
-- DROP TABLE public.tb_m_application;

create table public.tb_m_application ( id bigserial not null,
"name" varchar(50) not null,
url varchar(200) null,
initial_page varchar(200) null,
description varchar(200) null,
icon varchar(100) null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_application_pkey primary key (id));

-- public.tb_m_application_id_seq definition
-- DROP SEQUENCE public.tb_m_application_id_seq;

CREATE SEQUENCE public.tb_m_application_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


insert
    into
    public.tb_m_application (id,
    "name",
    url,
    initial_page,
    description,
    icon,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 'PRMS', '', null, 'Project Resource Management System', null, 'system', '2026-08-10 05:01:05.092', null, null);

SELECT setval('public.tb_m_application_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_application), 1));
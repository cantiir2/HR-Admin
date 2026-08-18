-- public.tb_m_feature definition
-- Drop table
-- DROP TABLE public.tb_m_feature;

create table public.tb_m_feature ( id bigserial not null,
api_method varchar(50) not null,
api_url varchar(200) not null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_feature_pkey primary key (id));

-- public.tb_m_feature_id_seq definition
-- DROP SEQUENCE public.tb_m_feature_id_seq;

CREATE SEQUENCE public.tb_m_feature_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(33, 'DELETE', '/api/system/*', 'system', '2026-08-10 05:01:05.174', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(34, 'GET', '/api/authorization/*', 'system', '2026-08-10 05:01:05.175', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(35, 'POST', '/api/authorization/*', 'system', '2026-08-10 05:01:05.176', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(36, 'PUT', '/api/authorization/*', 'system', '2026-08-10 05:25:17.665', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(37, 'DELETE', '/api/authorization/*', 'system', '2026-08-10 05:36:27.707', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(38, 'GET', '/api/attendance', 'system', '2026-08-10 06:55:05.721', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(39, '*', '/api/attendance-requests/*', 'system', '2026-08-10 06:55:05.724', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(40, '*', '/api/working-reports/*', 'system', '2026-08-10 06:55:05.725', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(41, '*', '/api/leaves/*', 'system', '2026-08-10 06:55:05.727', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(42, 'GET', '/api/projects', 'system', '2026-08-10 06:55:05.728', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(43, '*', '/api/users/me/*', 'system', '2026-08-10 06:55:05.729', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(44, 'PUT', '/api/leaves/*', 'system', '2026-08-10 06:55:05.731', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(46, 'GET', '/api/notifications/unread-count', 'admin@hr.com', '2026-08-10 07:03:17.517', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(47, 'GET', '/api/notifications', 'admin@hr.com', '2026-08-10 07:03:42.255', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(48, 'GET', '/api/authorization/roles', 'admin@hr.com', '2026-08-10 07:58:43.173', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(45, 'GET', '/api/notifications/*', 'system', '2026-08-10 06:55:05.733', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(49, 'PATCH', 'api/users/add', 'admin@hr.com', '2026-08-14 09:57:36.911', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 'GET', '/api/users', 'system', '2026-08-10 05:01:05.135', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 'POST', '/api/users/search', 'system', '2026-08-10 05:01:05.138', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(50, 'POST', '/api/users/add', 'admin@hr.com', '2026-08-14 09:58:14.258', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 'POST', '/api/users/add', 'system', '2026-08-10 05:01:05.139', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 'GET', '/api/users/*', 'system', '2026-08-10 05:01:05.140', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(5, 'PUT', '/api/users/*', 'system', '2026-08-10 05:01:05.141', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(6, 'DELETE', '/api/users/*', 'system', '2026-08-10 05:01:05.142', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(7, 'GET', '/api/attendance', 'system', '2026-08-10 05:01:05.144', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(8, 'POST', '/api/attendance/*', 'system', '2026-08-10 05:01:05.145', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(9, 'GET', '/api/attendance-requests', 'system', '2026-08-10 05:01:05.146', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(10, 'POST', '/api/attendance-requests', 'system', '2026-08-10 05:01:05.147', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(11, 'PUT', '/api/attendance-requests/*', 'system', '2026-08-10 05:01:05.148', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(12, 'GET', '/api/leaves', 'system', '2026-08-10 05:01:05.149', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(13, 'POST', '/api/leaves', 'system', '2026-08-10 05:01:05.151', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(14, 'PUT', '/api/leaves/*', 'system', '2026-08-10 05:01:05.152', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(15, 'GET', '/api/working-reports', 'system', '2026-08-10 05:01:05.153', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(16, 'POST', '/api/working-reports', 'system', '2026-08-10 05:01:05.154', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(17, 'PUT', '/api/working-reports/*', 'system', '2026-08-10 05:01:05.155', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(18, 'GET', '/api/projects', 'system', '2026-08-10 05:01:05.157', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(19, 'POST', '/api/projects', 'system', '2026-08-10 05:01:05.158', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(20, 'PUT', '/api/projects/*', 'system', '2026-08-10 05:01:05.159', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(21, 'DELETE', '/api/projects/*', 'system', '2026-08-10 05:01:05.161', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(22, 'GET', '/api/projects/*', 'system', '2026-08-10 05:01:05.163', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(23, 'GET', '/api/geofences', 'system', '2026-08-10 05:01:05.164', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(24, 'POST', '/api/geofences', 'system', '2026-08-10 05:01:05.165', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(25, 'PUT', '/api/geofences/*', 'system', '2026-08-10 05:01:05.166', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(26, 'DELETE', '/api/geofences/*', 'system', '2026-08-10 05:01:05.167', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(27, 'GET', '/api/project-resources', 'system', '2026-08-10 05:01:05.168', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(28, 'POST', '/api/project-resources', 'system', '2026-08-10 05:01:05.169', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(29, 'GET', '/api/users/available-members', 'system', '2026-08-10 05:01:05.170', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(30, 'GET', '/api/system', 'system', '2026-08-10 05:01:05.171', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(31, 'POST', '/api/system', 'system', '2026-08-10 05:01:05.172', null, null);

insert
    into
    public.tb_m_feature (id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(32, 'PUT', '/api/system/*', 'system', '2026-08-10 05:01:05.173', null, null);

SELECT setval('public.tb_m_feature_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_feature), 1));


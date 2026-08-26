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

INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(33, 'DELETE', '/api/system/*', 'system', '2026-08-10 05:01:05.174', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(34, 'GET', '/api/authorization/*', 'system', '2026-08-10 05:01:05.175', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(35, 'POST', '/api/authorization/*', 'system', '2026-08-10 05:01:05.176', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(36, 'PUT', '/api/authorization/*', 'system', '2026-08-10 05:25:17.665', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(37, 'DELETE', '/api/authorization/*', 'system', '2026-08-10 05:36:27.707', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(38, 'GET', '/api/attendance', 'system', '2026-08-10 06:55:05.721', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(39, '*', '/api/attendance-requests/*', 'system', '2026-08-10 06:55:05.724', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(40, '*', '/api/working-reports/*', 'system', '2026-08-10 06:55:05.725', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(41, '*', '/api/leaves/*', 'system', '2026-08-10 06:55:05.727', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(42, 'GET', '/api/projects', 'system', '2026-08-10 06:55:05.728', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(43, '*', '/api/users/me/*', 'system', '2026-08-10 06:55:05.729', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(44, 'PUT', '/api/leaves/*', 'system', '2026-08-10 06:55:05.731', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(46, 'GET', '/api/notifications/unread-count', 'admin@hr.com', '2026-08-10 07:03:17.517', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(47, 'GET', '/api/notifications', 'admin@hr.com', '2026-08-10 07:03:42.255', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(48, 'GET', '/api/authorization/roles', 'admin@hr.com', '2026-08-10 07:58:43.173', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(45, 'GET', '/api/notifications/*', 'system', '2026-08-10 06:55:05.733', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(49, 'PATCH', 'api/users/add', 'admin@hr.com', '2026-08-14 09:57:36.911', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(1, 'GET', '/api/users', 'system', '2026-08-10 05:01:05.135', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(2, 'POST', '/api/users/search', 'system', '2026-08-10 05:01:05.138', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(50, 'POST', '/api/users/add', 'admin@hr.com', '2026-08-14 09:58:14.258', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(3, 'POST', '/api/users/add', 'system', '2026-08-10 05:01:05.139', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(4, 'GET', '/api/users/*', 'system', '2026-08-10 05:01:05.140', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(5, 'PUT', '/api/users/*', 'system', '2026-08-10 05:01:05.141', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(6, 'DELETE', '/api/users/*', 'system', '2026-08-10 05:01:05.142', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(7, 'GET', '/api/attendance', 'system', '2026-08-10 05:01:05.144', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(8, 'POST', '/api/attendance/*', 'system', '2026-08-10 05:01:05.145', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(9, 'GET', '/api/attendance-requests', 'system', '2026-08-10 05:01:05.146', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(10, 'POST', '/api/attendance-requests', 'system', '2026-08-10 05:01:05.147', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(11, 'PUT', '/api/attendance-requests/*', 'system', '2026-08-10 05:01:05.148', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(12, 'GET', '/api/leaves', 'system', '2026-08-10 05:01:05.149', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(13, 'POST', '/api/leaves', 'system', '2026-08-10 05:01:05.151', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(14, 'PUT', '/api/leaves/*', 'system', '2026-08-10 05:01:05.152', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(15, 'GET', '/api/working-reports', 'system', '2026-08-10 05:01:05.153', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(16, 'POST', '/api/working-reports', 'system', '2026-08-10 05:01:05.154', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(17, 'PUT', '/api/working-reports/*', 'system', '2026-08-10 05:01:05.155', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(18, 'GET', '/api/projects', 'system', '2026-08-10 05:01:05.157', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(19, 'POST', '/api/projects', 'system', '2026-08-10 05:01:05.158', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(20, 'PUT', '/api/projects/*', 'system', '2026-08-10 05:01:05.159', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(21, 'DELETE', '/api/projects/*', 'system', '2026-08-10 05:01:05.161', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(22, 'GET', '/api/projects/*', 'system', '2026-08-10 05:01:05.163', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(23, 'GET', '/api/geofences', 'system', '2026-08-10 05:01:05.164', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(24, 'POST', '/api/geofences', 'system', '2026-08-10 05:01:05.165', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(25, 'PUT', '/api/geofences/*', 'system', '2026-08-10 05:01:05.166', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(26, 'DELETE', '/api/geofences/*', 'system', '2026-08-10 05:01:05.167', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(27, 'GET', '/api/project-resources', 'system', '2026-08-10 05:01:05.168', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(28, 'POST', '/api/project-resources', 'system', '2026-08-10 05:01:05.169', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(29, 'GET', '/api/users/available-members', 'system', '2026-08-10 05:01:05.170', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(30, 'GET', '/api/system', 'system', '2026-08-10 05:01:05.171', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(31, 'POST', '/api/system', 'system', '2026-08-10 05:01:05.172', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(32, 'PUT', '/api/system/*', 'system', '2026-08-10 05:01:05.173', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(51, 'POST', '/api/projects/search', 'admin@hr.com', '2026-08-18 05:33:12.807', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(52, 'GET', '/api/attendance-requests/*', 'admin@hr.com', '2026-08-18 05:49:52.893', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(53, 'GET', '/api/attendance/locations', 'admin@hr.com', '2026-08-18 06:52:22.351', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(54, 'GET', '/api/attendance/locations', 'admin@hr.com', '2026-08-18 06:55:10.681', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(55, 'GET', '/api/geofences', 'admin@hr.com', '2026-08-18 06:56:49.660', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(56, 'POST', '/api/users/available-members/search', 'admin@hr.com', '2026-08-18 07:20:19.092', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(57, 'GET', '/api/attendance/me', 'admin@hr.com', '2026-08-18 07:48:14.116', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(58, 'GET', '/api/projects/my-projects', 'admin@hr.com', '2026-08-18 07:48:32.589', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(59, 'GET', '/api/projects/my-projects', 'admin@hr.com', '2026-08-18 07:49:04.110', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(60, 'POST', '/api/attendance/check-in', 'admin@hr.com', '2026-08-18 07:52:27.824', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(61, 'POST', '/api/attendance/check-out', 'admin@hr.com', '2026-08-18 07:53:07.038', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(62, 'GET', '/api/working-reports/*', 'admin@hr.com', '2026-08-19 03:12:13.793', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(63, 'GET', '/api/system', 'admin@hr.com', '2026-08-19 06:29:30.777', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(64, 'GET', '/api/attendance/export', 'admin@hr.com', '2026-08-20 04:14:39.139', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(65, 'GET', '/api/system', 'admin@hr.com', '2026-08-20 04:18:42.317', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(66, 'POST', '/api/projects/*', 'admin@hr.com', '2026-08-20 10:04:54.211', NULL, NULL);
INSERT INTO public.tb_m_feature (id, api_method, api_url, created_by, created_dt, changed_by, changed_dt) VALUES(67, 'POST', '	/api/users/*', 'admin@hr.com', '2026-08-24 02:18:30.499', NULL, NULL);

SELECT setval('public.tb_m_feature_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_feature), 1));


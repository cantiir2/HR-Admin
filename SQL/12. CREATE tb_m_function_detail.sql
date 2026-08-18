-- public.tb_m_function_detail definition
-- Drop table
-- DROP TABLE public.tb_m_function_detail;

create table public.tb_m_function_detail ( application_id int8 not null,
function_id int8 not null,
feature_id int8 not null,
api_method varchar(50) not null,
api_url varchar(200) not null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_function_detail_pkey primary key (application_id,
function_id,
feature_id));

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 1, 'GET', '/api/users', 'system', '2026-08-11 04:15:49.091', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 1, 'GET', '/api/users', 'system', '2026-08-11 04:15:49.111', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 2, 'POST', '/api/users/search', 'system', '2026-08-11 04:15:49.112', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 3, 'POST', '/api/users', 'system', '2026-08-11 04:15:49.113', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 4, 'GET', '/api/users/*', 'system', '2026-08-11 04:15:49.115', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 5, 'PUT', '/api/users/*', 'system', '2026-08-11 04:15:49.116', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 6, 'DELETE', '/api/users/*', 'system', '2026-08-11 04:15:49.117', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 3, 7, 'GET', '/api/attendance', 'system', '2026-08-11 04:15:49.118', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 3, 8, 'POST', '/api/attendance/*', 'system', '2026-08-11 04:15:49.119', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 4, 9, 'GET', '/api/attendance-requests', 'system', '2026-08-11 04:15:49.120', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 4, 10, 'POST', '/api/attendance-requests', 'system', '2026-08-11 04:15:49.122', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 4, 11, 'PUT', '/api/attendance-requests/*', 'system', '2026-08-11 04:15:49.127', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 5, 12, 'GET', '/api/leaves', 'system', '2026-08-11 04:15:49.128', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 5, 13, 'POST', '/api/leaves', 'system', '2026-08-11 04:15:49.129', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 5, 14, 'PUT', '/api/leaves/*', 'system', '2026-08-11 04:15:49.130', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 6, 15, 'GET', '/api/working-reports', 'system', '2026-08-11 04:15:49.131', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 6, 16, 'POST', '/api/working-reports', 'system', '2026-08-11 04:15:49.132', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 6, 17, 'PUT', '/api/working-reports/*', 'system', '2026-08-11 04:15:49.133', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 18, 'GET', '/api/projects', 'system', '2026-08-11 04:15:49.134', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 19, 'POST', '/api/projects', 'system', '2026-08-11 04:15:49.135', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 20, 'PUT', '/api/projects/*', 'system', '2026-08-11 04:15:49.136', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 21, 'DELETE', '/api/projects/*', 'system', '2026-08-11 04:15:49.138', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 22, 'GET', '/api/projects/*', 'system', '2026-08-11 04:15:49.142', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 8, 23, 'GET', '/api/geofences', 'system', '2026-08-11 04:15:49.143', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 8, 24, 'POST', '/api/geofences', 'system', '2026-08-11 04:15:49.145', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 8, 25, 'PUT', '/api/geofences/*', 'system', '2026-08-11 04:15:49.146', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 8, 26, 'DELETE', '/api/geofences/*', 'system', '2026-08-11 04:15:49.147', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 9, 27, 'GET', '/api/project-resources', 'system', '2026-08-11 04:15:49.148', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 9, 28, 'POST', '/api/project-resources', 'system', '2026-08-11 04:15:49.149', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 10, 29, 'GET', '/api/users/available-members', 'system', '2026-08-11 04:15:49.150', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 11, 30, 'GET', '/api/system', 'system', '2026-08-11 04:15:49.151', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 11, 31, 'POST', '/api/system', 'system', '2026-08-11 04:15:49.152', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 11, 32, 'PUT', '/api/system/*', 'system', '2026-08-11 04:15:49.153', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 11, 33, 'DELETE', '/api/system/*', 'system', '2026-08-11 04:15:49.155', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 12, 38, 'GET', '/api/attendance', 'system', '2026-08-11 04:15:49.156', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 13, 39, '*', '/api/attendance-requests/*', 'system', '2026-08-11 04:15:49.157', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 14, 40, '*', '/api/working-reports/*', 'system', '2026-08-11 04:15:49.158', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 15, 41, '*', '/api/leaves/*', 'system', '2026-08-11 04:15:49.159', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 16, 42, 'GET', '/api/projects', 'system', '2026-08-11 04:15:49.160', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 17, 43, '*', '/api/users/me/*', 'system', '2026-08-11 04:15:49.161', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 18, 44, 'PUT', '/api/leaves/*', 'system', '2026-08-11 04:15:49.162', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 19, 45, 'GET', '/api/notifications/*', 'system', '2026-08-11 04:15:49.163', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 20, 34, 'GET', '/api/authorization/*', 'system', '2026-08-11 04:15:49.164', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 20, 35, 'POST', '/api/authorization/*', 'system', '2026-08-11 04:15:49.165', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 20, 36, 'PUT', '/api/authorization/*', 'system', '2026-08-11 04:15:49.166', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 20, 37, 'DELETE', '/api/authorization/*', 'system', '2026-08-11 04:15:49.167', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 49, 'PATCH', 'api/users/add', 'admin@hr.com', '2026-08-14 09:57:36.915', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 2, 50, 'POST', '/api/users/add', 'admin@hr.com', '2026-08-14 09:58:14.262', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 21, 45, 'GET', '/api/notifications/*', 'system', '2026-08-18 05:07:02.951', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 21, 46, 'GET', '/api/notifications/unread-count', 'system', '2026-08-18 05:07:02.951', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 21, 47, 'GET', '/api/notifications', 'system', '2026-08-18 05:07:02.951', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 7, 51, 'POST', '/api/projects/search', 'admin@hr.com', '2026-08-18 05:33:12.811', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 4, 52, 'GET', '/api/attendance-requests/*', 'admin@hr.com', '2026-08-18 05:49:52.896', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 13, 53, 'GET', '/api/attendance/locations', 'admin@hr.com', '2026-08-18 06:52:22.353', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 54, 'GET', '/api/attendance/locations', 'admin@hr.com', '2026-08-18 06:55:10.685', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 55, 'GET', '/api/geofences', 'admin@hr.com', '2026-08-18 06:56:49.667', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 10, 56, 'POST', '/api/users/available-members/search', 'admin@hr.com', '2026-08-18 07:20:19.096', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 12, 57, 'GET', '/api/attendance/me', 'admin@hr.com', '2026-08-18 07:48:14.121', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 10, 58, 'GET', '/api/projects/my-projects', 'admin@hr.com', '2026-08-18 07:48:32.635', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 12, 59, 'GET', '/api/projects/my-projects', 'admin@hr.com', '2026-08-18 07:49:04.158', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 12, 60, 'POST', '/api/attendance/check-in', 'admin@hr.com', '2026-08-18 07:52:27.873', null, null);

insert
    into
    public.tb_m_function_detail (application_id,
    function_id,
    feature_id,
    api_method,
    api_url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 12, 61, 'POST', '/api/attendance/check-out', 'admin@hr.com', '2026-08-18 07:53:07.048', null, null);

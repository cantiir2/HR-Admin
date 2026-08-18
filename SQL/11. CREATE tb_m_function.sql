-- public.tb_m_function definition
-- Drop table
-- DROP TABLE public.tb_m_function;

create table public.tb_m_function ( id bigserial not null,
application_id int8 not null,
"name" varchar(50) not null,
description varchar(200) null,
url varchar(200) not null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_function_pkey primary key (id));

-- public.tb_m_function_id_seq definition
-- DROP SEQUENCE public.tb_m_function_id_seq;

CREATE SEQUENCE public.tb_m_function_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 'Dashboard Admin', 'Admin Dashboard Overview', '/admin', 'system', '2026-08-10 05:01:05.107', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 'User Management', 'Manage System Users and Contracts', '/admin/users', 'system', '2026-08-10 05:01:05.110', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 'Absensi Admin', 'Attendance Monitoring', '/admin/attendance', 'system', '2026-08-10 05:01:05.112', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 'Attendance Requests Admin', 'Manage Attendance Correction Requests', '/admin/attendance-requests', 'system', '2026-08-10 05:01:05.113', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(5, 1, 'Annual Leave Admin', 'Manage Annual Leave Approvals', '/admin/leaves', 'system', '2026-08-10 05:01:05.115', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(6, 1, 'Working Report Admin', 'Manage Working Reports', '/admin/working-reports', 'system', '2026-08-10 05:01:05.116', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(7, 1, 'Project Management', 'Manage Projects and Milestones', '/admin/projects', 'system', '2026-08-10 05:01:05.118', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(8, 1, 'Area Mapping', 'Manage Geofences and Office Areas', '/admin/project-geofence', 'system', '2026-08-10 05:01:05.119', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(9, 1, 'Project Resource', 'Manage Project Resource Allocations', '/admin/project-resources', 'system', '2026-08-10 05:01:05.120', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(21, 1, 'Admin Notification', 'Notifikasi untuk admin', '/admin/notifications', 'admin@hr.com', '2026-08-10 06:12:44.526', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(10, 1, 'Available Member', 'View Available Members for Allocation', '/admin/available-members', 'system', '2026-08-10 05:01:05.121', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(11, 1, 'System Master', 'Lookup & System Master Configurations', '/admin/system', 'system', '2026-08-10 05:01:05.122', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(12, 1, 'Dashboard Employee', 'Employee Dashboard and Check-in', '/member', 'system', '2026-08-10 05:01:05.124', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(13, 1, 'Attendance Request Employee', 'Employee Attendance Requests', '/member/attendance-requests', 'system', '2026-08-10 05:01:05.125', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(14, 1, 'Working Report Employee', 'Employee Working Reports', '/member/working-report', 'system', '2026-08-10 05:01:05.127', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(15, 1, 'Annual Leave Employee', 'Employee Annual Leave Request', '/member/annual-leave', 'system', '2026-08-10 05:01:05.129', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(16, 1, 'Project Saya', 'Employee Assigned Projects', '/member/projects', 'system', '2026-08-10 05:01:05.130', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(17, 1, 'Profil Saya', 'Employee Personal Profile', '/member/profile', 'system', '2026-08-10 05:01:05.132', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(18, 1, 'Leave Approval PM', 'Project Manager Leave Approvals', '/member/leave-approval', 'system', '2026-08-10 05:01:05.133', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(19, 1, 'Inbox Notifications', 'System Notifications and Alerts', '/notifications', 'system', '2026-08-10 05:01:05.134', null, null);

insert
    into
    public.tb_m_function (id,
    application_id,
    "name",
    description,
    url,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(20, 1, 'Otorisasi & Hak Akses', 'Manage Roles, Permissions, Menus, & API Endpoints', '/admin/authorization', 'system', '2026-08-10 05:25:17.618', null, null);

SELECT setval('public.tb_m_function_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_function), 1));


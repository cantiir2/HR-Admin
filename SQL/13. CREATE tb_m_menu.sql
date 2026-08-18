-- public.tb_m_menu definition
-- Drop table
-- DROP TABLE public.tb_m_menu;

create table public.tb_m_menu ( id bigserial not null,
parent_id int8 null,
display_text varchar(100) not null,
application_id int8 null,
function_id int8 null,
icon varchar(100) null,
is_active bool default true null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
seq int4 default 0 not null,
constraint tb_m_menu_pkey primary key (id));

-- public.tb_m_menu_id_seq definition
-- DROP SEQUENCE public.tb_m_menu_id_seq;

CREATE SEQUENCE public.tb_m_menu_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;


insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(1, null, 'Dashboard', 1, 1, 'Map', true, 'system', '2026-08-11 04:15:49.299', 'admin@hr.com', '2026-08-18 07:53:49.805', 5);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(2, null, 'User Management', 1, 2, 'Users', true, 'system', '2026-08-11 04:15:49.312', 'admin@hr.com', '2026-08-18 07:53:49.807', 6);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(5, 3, 'Attendance Requests', 1, 4, 'History', true, 'system', '2026-08-11 04:15:49.314', 'admin@hr.com', '2026-08-18 07:53:49.810', 7);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(10, 8, 'Area Mapping', 1, 8, 'Map', true, 'system', '2026-08-11 04:15:49.390', 'admin@hr.com', '2026-08-18 07:53:49.813', 8);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(18, 16, 'Working Report', 1, 14, 'FileText', true, 'system', '2026-08-11 04:15:49.398', 'admin@hr.com', '2026-08-18 07:53:49.815', 9);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(3, null, 'Time & Attendance', 1, null, 'FolderClosed', true, 'system', '2026-08-11 04:15:49.313', 'admin@hr.com', '2026-08-18 07:53:49.817', 10);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(6, 3, 'Annual Leave', 1, 5, 'CalendarDays', true, 'system', '2026-08-11 04:15:49.314', 'admin@hr.com', '2026-08-18 07:53:49.819', 11);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(11, 8, 'Project Resource', 1, 9, 'CalendarCheck', true, 'system', '2026-08-11 04:15:49.390', 'admin@hr.com', '2026-08-18 07:53:49.821', 12);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(17, 16, 'Attendance Request', 1, 13, 'History', true, 'system', '2026-08-11 04:15:49.398', 'admin@hr.com', '2026-08-18 07:53:49.795', 1);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(9, 8, 'Project', 1, 7, 'FolderKanban', true, 'system', '2026-08-11 04:15:49.390', 'admin@hr.com', '2026-08-18 07:53:49.799', 2);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(4, 3, 'Absensi', 1, 3, 'List', true, 'system', '2026-08-11 04:15:49.314', 'admin@hr.com', '2026-08-18 07:53:49.801', 3);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(15, null, 'Dashboard Absensi', 1, 12, 'Map', true, 'system', '2026-08-11 04:15:49.395', 'admin@hr.com', '2026-08-18 07:53:49.803', 4);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(19, 16, 'Annual Leave', 1, 15, 'CalendarDays', true, 'system', '2026-08-11 04:15:49.398', 'admin@hr.com', '2026-08-18 07:53:49.823', 13);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(7, 3, 'Working Report', 1, 6, 'FileText', true, 'system', '2026-08-11 04:15:49.314', 'admin@hr.com', '2026-08-18 07:53:49.825', 14);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(12, 8, 'Available Member', 1, 10, 'CalendarCheck', true, 'system', '2026-08-11 04:15:49.390', 'admin@hr.com', '2026-08-18 07:53:49.827', 15);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(8, null, 'Project Management', 1, null, 'FolderClosed', true, 'system', '2026-08-11 04:15:49.388', 'admin@hr.com', '2026-08-18 07:53:49.829', 16);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(14, null, 'System Master', 1, 11, 'Settings', true, 'system', '2026-08-11 04:15:49.393', 'admin@hr.com', '2026-08-18 07:53:49.833', 18);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(23, null, 'Otorisasi & Hak Akses', 1, 20, 'ShieldCheck', true, 'system', '2026-08-11 04:15:49.394', 'admin@hr.com', '2026-08-18 07:53:49.835', 19);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(16, null, 'Time Management', 1, null, 'FolderClosed', true, 'system', '2026-08-11 04:15:49.397', 'admin@hr.com', '2026-08-18 07:53:49.837', 20);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(20, null, 'Project Saya', 1, 16, 'FolderClosed', true, 'system', '2026-08-11 04:15:49.400', 'admin@hr.com', '2026-08-18 07:53:49.840', 21);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(21, null, 'Profil Saya', 1, 17, 'User', true, 'system', '2026-08-11 04:15:49.401', 'admin@hr.com', '2026-08-18 07:53:49.842', 22);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(22, null, 'Leave Approval', 1, 18, 'ClipboardCheck', true, 'system', '2026-08-11 04:15:49.403', 'admin@hr.com', '2026-08-18 07:53:49.844', 23);

insert
    into
    public.tb_m_menu (id,
    parent_id,
    display_text,
    application_id,
    function_id,
    icon,
    is_active,
    created_by,
    created_dt,
    changed_by,
    changed_dt,
    seq)
values(24, null, 'Admin Notification', 1, 21, 'Bell', true, 'admin@hr.com', '2026-08-18 04:53:28.815', 'admin@hr.com', '2026-08-18 07:53:49.846', 24);


SELECT setval('public.tb_m_menu_id_seq', COALESCE((SELECT MAX(id) FROM public.tb_m_menu), 1));


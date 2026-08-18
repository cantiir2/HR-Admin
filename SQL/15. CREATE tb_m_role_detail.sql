-- public.tb_m_role_detail definition
-- Drop table
-- DROP TABLE public.tb_m_role_detail;

create table public.tb_m_role_detail ( role_id int8 not null,
application_id int8 not null,
function_id int8 not null,
feature_id int8 not null,
created_by varchar(50) null,
created_dt timestamp(3) default CURRENT_TIMESTAMP null,
changed_by varchar(50) null,
changed_dt timestamp(3) null,
constraint tb_m_role_detail_pkey primary key (role_id,
application_id,
function_id,
feature_id));

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 1, 1, 'admin@hr.com', '2026-08-14 10:47:33.813', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 1, 'admin@hr.com', '2026-08-14 10:47:33.815', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 2, 'admin@hr.com', '2026-08-14 10:47:33.817', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 4, 'admin@hr.com', '2026-08-14 10:47:33.820', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 3, 7, 'admin@hr.com', '2026-08-14 10:47:33.822', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 3, 8, 'admin@hr.com', '2026-08-14 10:47:33.824', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 4, 9, 'admin@hr.com', '2026-08-14 10:47:33.833', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 4, 10, 'admin@hr.com', '2026-08-14 10:47:33.835', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 4, 11, 'admin@hr.com', '2026-08-14 10:47:33.838', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 5, 12, 'admin@hr.com', '2026-08-14 10:47:33.840', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 5, 13, 'admin@hr.com', '2026-08-14 10:47:33.842', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 5, 14, 'admin@hr.com', '2026-08-14 10:47:33.846', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 6, 15, 'admin@hr.com', '2026-08-14 10:47:33.849', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 6, 16, 'admin@hr.com', '2026-08-14 10:47:33.853', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 6, 17, 'admin@hr.com', '2026-08-14 10:47:33.856', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 7, 18, 'admin@hr.com', '2026-08-14 10:47:33.858', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 7, 19, 'admin@hr.com', '2026-08-14 10:47:33.861', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 7, 20, 'admin@hr.com', '2026-08-14 10:47:33.864', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 7, 21, 'admin@hr.com', '2026-08-14 10:47:33.867', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 7, 22, 'admin@hr.com', '2026-08-14 10:47:33.869', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 8, 23, 'admin@hr.com', '2026-08-14 10:47:33.871', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 8, 24, 'admin@hr.com', '2026-08-14 10:47:33.873', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 8, 25, 'admin@hr.com', '2026-08-14 10:47:33.878', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 8, 26, 'admin@hr.com', '2026-08-14 10:47:33.881', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 9, 27, 'admin@hr.com', '2026-08-14 10:47:33.883', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 9, 28, 'admin@hr.com', '2026-08-14 10:47:33.885', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 10, 29, 'admin@hr.com', '2026-08-14 10:47:33.887', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 11, 30, 'admin@hr.com', '2026-08-14 10:47:33.889', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 11, 31, 'admin@hr.com', '2026-08-14 10:47:33.893', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 11, 32, 'admin@hr.com', '2026-08-14 10:47:33.895', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 11, 33, 'admin@hr.com', '2026-08-14 10:47:33.897', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 20, 34, 'admin@hr.com', '2026-08-14 10:47:33.900', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 20, 36, 'admin@hr.com', '2026-08-14 10:47:33.902', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 20, 37, 'admin@hr.com', '2026-08-14 10:47:33.904', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 6, 'admin@hr.com', '2026-08-14 10:47:33.906', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 20, 35, 'admin@hr.com', '2026-08-14 10:47:33.909', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 5, 'admin@hr.com', '2026-08-14 10:47:33.911', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(1, 1, 2, 50, 'admin@hr.com', '2026-08-14 10:47:33.913', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 1, 1, 'system', '2026-08-11 04:15:49.238', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 1, 'system', '2026-08-11 04:15:49.239', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 2, 'system', '2026-08-11 04:15:49.240', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 3, 'system', '2026-08-11 04:15:49.241', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 4, 'system', '2026-08-11 04:15:49.242', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 5, 'system', '2026-08-11 04:15:49.243', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 2, 6, 'system', '2026-08-11 04:15:49.243', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 3, 7, 'system', '2026-08-11 04:15:49.244', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 3, 8, 'system', '2026-08-11 04:15:49.245', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 4, 9, 'system', '2026-08-11 04:15:49.246', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 4, 10, 'system', '2026-08-11 04:15:49.247', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 4, 11, 'system', '2026-08-11 04:15:49.248', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 5, 12, 'system', '2026-08-11 04:15:49.249', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 5, 13, 'system', '2026-08-11 04:15:49.249', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 5, 14, 'system', '2026-08-11 04:15:49.250', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 6, 15, 'system', '2026-08-11 04:15:49.251', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 6, 16, 'system', '2026-08-11 04:15:49.252', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 6, 17, 'system', '2026-08-11 04:15:49.253', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 11, 30, 'system', '2026-08-11 04:15:49.254', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 11, 31, 'system', '2026-08-11 04:15:49.255', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 11, 32, 'system', '2026-08-11 04:15:49.256', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 11, 33, 'system', '2026-08-11 04:15:49.257', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 12, 38, 'system', '2026-08-11 04:15:49.258', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 13, 39, 'system', '2026-08-11 04:15:49.259', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 14, 40, 'system', '2026-08-11 04:15:49.260', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 15, 41, 'system', '2026-08-11 04:15:49.261', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 16, 42, 'system', '2026-08-11 04:15:49.262', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 17, 43, 'system', '2026-08-11 04:15:49.264', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(2, 1, 19, 45, 'system', '2026-08-11 04:15:49.265', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 7, 18, 'system', '2026-08-11 04:15:49.267', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 7, 19, 'system', '2026-08-11 04:15:49.268', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 7, 20, 'system', '2026-08-11 04:15:49.269', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 7, 21, 'system', '2026-08-11 04:15:49.271', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 7, 22, 'system', '2026-08-11 04:15:49.272', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 8, 23, 'system', '2026-08-11 04:15:49.273', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 8, 24, 'system', '2026-08-11 04:15:49.274', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 8, 25, 'system', '2026-08-11 04:15:49.275', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 8, 26, 'system', '2026-08-11 04:15:49.276', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 9, 27, 'system', '2026-08-11 04:15:49.277', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 9, 28, 'system', '2026-08-11 04:15:49.278', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 10, 29, 'system', '2026-08-11 04:15:49.280', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 12, 38, 'system', '2026-08-11 04:15:49.281', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 13, 39, 'system', '2026-08-11 04:15:49.282', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 14, 40, 'system', '2026-08-11 04:15:49.283', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 15, 41, 'system', '2026-08-11 04:15:49.284', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 16, 42, 'system', '2026-08-11 04:15:49.284', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 17, 43, 'system', '2026-08-11 04:15:49.285', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 18, 44, 'system', '2026-08-11 04:15:49.286', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(3, 1, 19, 45, 'system', '2026-08-11 04:15:49.287', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 12, 38, 'system', '2026-08-11 04:15:49.290', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 13, 39, 'system', '2026-08-11 04:15:49.290', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 14, 40, 'system', '2026-08-11 04:15:49.291', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 15, 41, 'system', '2026-08-11 04:15:49.292', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 16, 42, 'system', '2026-08-11 04:15:49.293', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 17, 43, 'system', '2026-08-11 04:15:49.294', null, null);

insert
    into
    public.tb_m_role_detail (role_id,
    application_id,
    function_id,
    feature_id,
    created_by,
    created_dt,
    changed_by,
    changed_dt)
values(4, 1, 19, 45, 'system', '2026-08-11 04:15:49.295', null, null);

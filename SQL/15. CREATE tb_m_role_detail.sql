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
values(1, 1, 20, 36, 'admin@hr.com', '2026-08-18 07:20:25.459', null, null);

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
values(1, 1, 20, 37, 'admin@hr.com', '2026-08-18 07:20:25.479', null, null);

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
values(1, 1, 2, 6, 'admin@hr.com', '2026-08-18 07:20:25.482', null, null);

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
values(1, 1, 20, 35, 'admin@hr.com', '2026-08-18 07:20:25.486', null, null);

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
values(1, 1, 2, 5, 'admin@hr.com', '2026-08-18 07:20:25.494', null, null);

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
values(1, 1, 2, 50, 'admin@hr.com', '2026-08-18 07:20:25.498', null, null);

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
values(1, 1, 7, 51, 'admin@hr.com', '2026-08-18 07:20:25.502', null, null);

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
values(1, 1, 21, 46, 'admin@hr.com', '2026-08-18 07:20:25.506', null, null);

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
values(1, 1, 21, 47, 'admin@hr.com', '2026-08-18 07:20:25.509', null, null);

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
values(1, 1, 1, 1, 'admin@hr.com', '2026-08-18 07:20:25.513', null, null);

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
values(1, 1, 2, 1, 'admin@hr.com', '2026-08-18 07:20:25.515', null, null);

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
values(1, 1, 2, 2, 'admin@hr.com', '2026-08-18 07:20:25.520', null, null);

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
values(1, 1, 2, 4, 'admin@hr.com', '2026-08-18 07:20:25.523', null, null);

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
values(1, 1, 3, 7, 'admin@hr.com', '2026-08-18 07:20:25.526', null, null);

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
values(1, 1, 3, 8, 'admin@hr.com', '2026-08-18 07:20:25.530', null, null);

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
values(1, 1, 4, 9, 'admin@hr.com', '2026-08-18 07:20:25.534', null, null);

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
values(1, 1, 4, 10, 'admin@hr.com', '2026-08-18 07:20:25.537', null, null);

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
values(1, 1, 4, 11, 'admin@hr.com', '2026-08-18 07:20:25.541', null, null);

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
values(1, 1, 5, 12, 'admin@hr.com', '2026-08-18 07:20:25.544', null, null);

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
values(1, 1, 5, 13, 'admin@hr.com', '2026-08-18 07:20:25.547', null, null);

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
values(1, 1, 5, 14, 'admin@hr.com', '2026-08-18 07:20:25.551', null, null);

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
values(1, 1, 6, 15, 'admin@hr.com', '2026-08-18 07:20:25.555', null, null);

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
values(1, 1, 6, 16, 'admin@hr.com', '2026-08-18 07:20:25.559', null, null);

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
values(1, 1, 6, 17, 'admin@hr.com', '2026-08-18 07:20:25.562', null, null);

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
values(1, 1, 7, 18, 'admin@hr.com', '2026-08-18 07:20:25.567', null, null);

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
values(1, 1, 7, 19, 'admin@hr.com', '2026-08-18 07:20:25.571', null, null);

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
values(1, 1, 7, 20, 'admin@hr.com', '2026-08-18 07:20:25.575', null, null);

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
values(1, 1, 7, 21, 'admin@hr.com', '2026-08-18 07:20:25.578', null, null);

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
values(1, 1, 7, 22, 'admin@hr.com', '2026-08-18 07:20:25.582', null, null);

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
values(1, 1, 8, 23, 'admin@hr.com', '2026-08-18 07:20:25.587', null, null);

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
values(1, 1, 8, 24, 'admin@hr.com', '2026-08-18 07:20:25.591', null, null);

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
values(1, 1, 8, 25, 'admin@hr.com', '2026-08-18 07:20:25.594', null, null);

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
values(1, 1, 8, 26, 'admin@hr.com', '2026-08-18 07:20:25.597', null, null);

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
values(1, 1, 9, 27, 'admin@hr.com', '2026-08-18 07:20:25.601', null, null);

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
values(1, 1, 9, 28, 'admin@hr.com', '2026-08-18 07:20:25.605', null, null);

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
values(1, 1, 10, 29, 'admin@hr.com', '2026-08-18 07:20:25.608', null, null);

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
values(1, 1, 11, 30, 'admin@hr.com', '2026-08-18 07:20:25.611', null, null);

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
values(1, 1, 11, 31, 'admin@hr.com', '2026-08-18 07:20:25.614', null, null);

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
values(1, 1, 11, 32, 'admin@hr.com', '2026-08-18 07:20:25.621', null, null);

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
values(1, 1, 11, 33, 'admin@hr.com', '2026-08-18 07:20:25.625', null, null);

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
values(1, 1, 20, 34, 'admin@hr.com', '2026-08-18 07:20:25.629', null, null);

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
values(1, 1, 4, 52, 'admin@hr.com', '2026-08-18 07:20:25.633', null, null);

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
values(1, 1, 1, 54, 'admin@hr.com', '2026-08-18 07:20:25.637', null, null);

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
values(1, 1, 10, 56, 'admin@hr.com', '2026-08-18 07:20:25.641', null, null);

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
values(3, 1, 7, 18, 'admin@hr.com', '2026-08-18 07:20:57.645', null, null);

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
values(3, 1, 7, 19, 'admin@hr.com', '2026-08-18 07:20:57.648', null, null);

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
values(3, 1, 7, 20, 'admin@hr.com', '2026-08-18 07:20:57.652', null, null);

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
values(3, 1, 7, 21, 'admin@hr.com', '2026-08-18 07:20:57.656', null, null);

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
values(3, 1, 7, 22, 'admin@hr.com', '2026-08-18 07:20:57.667', null, null);

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
values(3, 1, 9, 27, 'admin@hr.com', '2026-08-18 07:20:57.670', null, null);

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
values(3, 1, 9, 28, 'admin@hr.com', '2026-08-18 07:20:57.673', null, null);

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
values(3, 1, 10, 29, 'admin@hr.com', '2026-08-18 07:20:57.676', null, null);

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
values(3, 1, 16, 42, 'admin@hr.com', '2026-08-18 07:20:57.678', null, null);

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
values(3, 1, 17, 43, 'admin@hr.com', '2026-08-18 07:20:57.682', null, null);

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
values(3, 1, 4, 9, 'admin@hr.com', '2026-08-18 07:20:57.685', null, null);

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
values(3, 1, 4, 10, 'admin@hr.com', '2026-08-18 07:20:57.688', null, null);

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
values(3, 1, 4, 11, 'admin@hr.com', '2026-08-18 07:20:57.691', null, null);

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
values(3, 1, 4, 52, 'admin@hr.com', '2026-08-18 07:20:57.694', null, null);

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
values(3, 1, 5, 12, 'admin@hr.com', '2026-08-18 07:20:57.697', null, null);

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
values(3, 1, 5, 14, 'admin@hr.com', '2026-08-18 07:20:57.701', null, null);

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
values(3, 1, 5, 13, 'admin@hr.com', '2026-08-18 07:20:57.704', null, null);

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
values(3, 1, 6, 15, 'admin@hr.com', '2026-08-18 07:20:57.708', null, null);

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
values(3, 1, 6, 16, 'admin@hr.com', '2026-08-18 07:20:57.710', null, null);

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
values(3, 1, 6, 17, 'admin@hr.com', '2026-08-18 07:20:57.714', null, null);

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
values(3, 1, 14, 40, 'admin@hr.com', '2026-08-18 07:20:57.718', null, null);

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
values(3, 1, 1, 1, 'admin@hr.com', '2026-08-18 07:20:57.720', null, null);

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
values(3, 1, 2, 1, 'admin@hr.com', '2026-08-18 07:20:57.722', null, null);

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
values(3, 1, 21, 47, 'admin@hr.com', '2026-08-18 07:20:57.725', null, null);

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
values(3, 1, 21, 46, 'admin@hr.com', '2026-08-18 07:20:57.728', null, null);

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
values(3, 1, 2, 2, 'admin@hr.com', '2026-08-18 07:20:57.731', null, null);

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
values(3, 1, 11, 30, 'admin@hr.com', '2026-08-18 07:20:57.735', null, null);

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
values(3, 1, 8, 23, 'admin@hr.com', '2026-08-18 07:20:57.738', null, null);

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
values(3, 1, 1, 54, 'admin@hr.com', '2026-08-18 07:20:57.742', null, null);

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
values(3, 1, 10, 56, 'admin@hr.com', '2026-08-18 07:20:57.745', null, null);

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
values(2, 1, 9, 27, 'admin@hr.com', '2026-08-18 07:20:53.761', null, null);

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
values(2, 1, 9, 28, 'admin@hr.com', '2026-08-18 07:20:53.767', null, null);

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
values(2, 1, 1, 1, 'admin@hr.com', '2026-08-18 07:20:53.771', null, null);

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
values(2, 1, 2, 1, 'admin@hr.com', '2026-08-18 07:20:53.773', null, null);

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
values(2, 1, 2, 2, 'admin@hr.com', '2026-08-18 07:20:53.777', null, null);

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
values(2, 1, 2, 3, 'admin@hr.com', '2026-08-18 07:20:53.781', null, null);

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
values(2, 1, 2, 4, 'admin@hr.com', '2026-08-18 07:20:53.785', null, null);

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
values(4, 1, 12, 38, 'admin@hr.com', '2026-08-18 07:56:15.587', null, null);

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
values(4, 1, 13, 39, 'admin@hr.com', '2026-08-18 07:56:15.593', null, null);

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
values(4, 1, 14, 40, 'admin@hr.com', '2026-08-18 07:56:15.606', null, null);

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
values(4, 1, 15, 41, 'admin@hr.com', '2026-08-18 07:56:15.609', null, null);

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
values(4, 1, 16, 42, 'admin@hr.com', '2026-08-18 07:56:15.613', null, null);

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
values(4, 1, 17, 43, 'admin@hr.com', '2026-08-18 07:56:15.617', null, null);

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
values(2, 1, 2, 5, 'admin@hr.com', '2026-08-18 07:20:53.789', null, null);

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
values(2, 1, 2, 6, 'admin@hr.com', '2026-08-18 07:20:53.792', null, null);

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
values(2, 1, 3, 7, 'admin@hr.com', '2026-08-18 07:20:53.800', null, null);

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
values(2, 1, 3, 8, 'admin@hr.com', '2026-08-18 07:20:53.804', null, null);

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
values(2, 1, 4, 9, 'admin@hr.com', '2026-08-18 07:20:53.807', null, null);

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
values(2, 1, 4, 10, 'admin@hr.com', '2026-08-18 07:20:53.810', null, null);

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
values(4, 1, 19, 45, 'admin@hr.com', '2026-08-18 07:56:15.620', null, null);

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
values(4, 1, 21, 45, 'admin@hr.com', '2026-08-18 07:56:15.622', null, null);

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
values(4, 1, 11, 30, 'admin@hr.com', '2026-08-18 07:56:15.625', null, null);

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
values(4, 1, 12, 57, 'admin@hr.com', '2026-08-18 07:56:15.627', null, null);

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
values(4, 1, 12, 59, 'admin@hr.com', '2026-08-18 07:56:15.631', null, null);

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
values(4, 1, 12, 60, 'admin@hr.com', '2026-08-18 07:56:15.633', null, null);

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
values(4, 1, 12, 61, 'admin@hr.com', '2026-08-18 07:56:15.635', null, null);

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
values(4, 1, 7, 22, 'admin@hr.com', '2026-08-18 07:56:15.637', null, null);

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
values(2, 1, 5, 12, 'admin@hr.com', '2026-08-18 07:20:53.813', null, null);

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
values(2, 1, 5, 13, 'admin@hr.com', '2026-08-18 07:20:53.817', null, null);

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
values(2, 1, 5, 14, 'admin@hr.com', '2026-08-18 07:20:53.819', null, null);

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
values(2, 1, 6, 15, 'admin@hr.com', '2026-08-18 07:20:53.822', null, null);

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
values(2, 1, 6, 16, 'admin@hr.com', '2026-08-18 07:20:53.824', null, null);

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
values(2, 1, 11, 30, 'admin@hr.com', '2026-08-18 07:20:53.826', null, null);

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
values(2, 1, 11, 31, 'admin@hr.com', '2026-08-18 07:20:53.829', null, null);

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
values(2, 1, 11, 32, 'admin@hr.com', '2026-08-18 07:20:53.831', null, null);

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
values(2, 1, 11, 33, 'admin@hr.com', '2026-08-18 07:20:53.834', null, null);

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
values(2, 1, 17, 43, 'admin@hr.com', '2026-08-18 07:20:53.837', null, null);

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
values(2, 1, 6, 17, 'admin@hr.com', '2026-08-18 07:20:53.840', null, null);

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
values(2, 1, 21, 47, 'admin@hr.com', '2026-08-18 07:20:53.843', null, null);

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
values(2, 1, 21, 46, 'admin@hr.com', '2026-08-18 07:20:53.845', null, null);

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
values(2, 1, 7, 18, 'admin@hr.com', '2026-08-18 07:20:53.848', null, null);

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
values(2, 1, 7, 51, 'admin@hr.com', '2026-08-18 07:20:53.851', null, null);

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
values(2, 1, 1, 54, 'admin@hr.com', '2026-08-18 07:20:53.855', null, null);

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
values(2, 1, 1, 55, 'admin@hr.com', '2026-08-18 07:20:53.858', null, null);

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
values(2, 1, 10, 29, 'admin@hr.com', '2026-08-18 07:20:53.861', null, null);

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
values(2, 1, 10, 56, 'admin@hr.com', '2026-08-18 07:20:53.865', null, null);

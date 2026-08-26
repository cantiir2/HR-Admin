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

INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 36, 'admin@hr.com', '2026-08-24 02:18:47.029', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 37, 'admin@hr.com', '2026-08-24 02:18:47.042', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 6, 'admin@hr.com', '2026-08-24 02:18:47.045', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 35, 'admin@hr.com', '2026-08-24 02:18:47.047', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 5, 'admin@hr.com', '2026-08-24 02:18:47.050', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 50, 'admin@hr.com', '2026-08-24 02:18:47.052', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 51, 'admin@hr.com', '2026-08-24 02:18:47.055', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 21, 46, 'admin@hr.com', '2026-08-24 02:18:47.057', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 21, 47, 'admin@hr.com', '2026-08-24 02:18:47.060', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 1, 1, 'admin@hr.com', '2026-08-24 02:18:47.062', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 1, 'admin@hr.com', '2026-08-24 02:18:47.064', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 2, 'admin@hr.com', '2026-08-24 02:18:47.066', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 4, 'admin@hr.com', '2026-08-24 02:18:47.068', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 3, 7, 'admin@hr.com', '2026-08-24 02:18:47.071', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 3, 8, 'admin@hr.com', '2026-08-24 02:18:47.073', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 9, 'admin@hr.com', '2026-08-24 02:18:47.075', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 10, 'admin@hr.com', '2026-08-24 02:18:47.078', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 11, 'admin@hr.com', '2026-08-24 02:18:47.080', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 12, 'admin@hr.com', '2026-08-24 02:18:47.083', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 13, 'admin@hr.com', '2026-08-24 02:18:47.085', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 14, 'admin@hr.com', '2026-08-24 02:18:47.087', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 15, 'admin@hr.com', '2026-08-24 02:18:47.089', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 16, 'admin@hr.com', '2026-08-24 02:18:47.091', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 17, 'admin@hr.com', '2026-08-24 02:18:47.094', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 18, 'admin@hr.com', '2026-08-24 02:18:47.096', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 19, 'admin@hr.com', '2026-08-24 02:18:47.098', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 20, 'admin@hr.com', '2026-08-24 02:18:47.100', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 21, 'admin@hr.com', '2026-08-24 02:18:47.102', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 22, 'admin@hr.com', '2026-08-24 02:18:47.104', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 23, 'admin@hr.com', '2026-08-24 02:18:47.106', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 24, 'admin@hr.com', '2026-08-24 02:18:47.109', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 25, 'admin@hr.com', '2026-08-24 02:18:47.111', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 26, 'admin@hr.com', '2026-08-24 02:18:47.114', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 9, 27, 'admin@hr.com', '2026-08-24 02:18:47.116', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 9, 28, 'admin@hr.com', '2026-08-24 02:18:47.118', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 10, 29, 'admin@hr.com', '2026-08-24 02:18:47.120', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 30, 'admin@hr.com', '2026-08-24 02:18:47.123', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 31, 'admin@hr.com', '2026-08-24 02:18:47.125', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 32, 'admin@hr.com', '2026-08-24 02:18:47.128', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 33, 'admin@hr.com', '2026-08-24 02:18:47.131', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 34, 'admin@hr.com', '2026-08-24 02:18:47.133', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 52, 'admin@hr.com', '2026-08-24 02:18:47.135', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 1, 54, 'admin@hr.com', '2026-08-24 02:18:47.137', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 10, 56, 'admin@hr.com', '2026-08-24 02:18:47.139', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 62, 'admin@hr.com', '2026-08-24 02:18:47.141', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 66, 'admin@hr.com', '2026-08-24 02:18:47.143', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 67, 'admin@hr.com', '2026-08-24 02:18:47.146', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 38, 'admin@hr.com', '2026-08-20 04:19:32.005', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 13, 39, 'admin@hr.com', '2026-08-20 04:19:32.009', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 14, 40, 'admin@hr.com', '2026-08-20 04:19:32.011', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 15, 41, 'admin@hr.com', '2026-08-20 04:19:32.015', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 16, 42, 'admin@hr.com', '2026-08-20 04:19:32.025', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 17, 43, 'admin@hr.com', '2026-08-20 04:19:32.028', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 19, 45, 'admin@hr.com', '2026-08-20 04:19:32.030', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 21, 45, 'admin@hr.com', '2026-08-20 04:19:32.032', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 57, 'admin@hr.com', '2026-08-20 04:19:32.035', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 59, 'admin@hr.com', '2026-08-20 04:19:32.038', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 60, 'admin@hr.com', '2026-08-20 04:19:32.041', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 61, 'admin@hr.com', '2026-08-20 04:19:32.044', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 64, 'admin@hr.com', '2026-08-20 04:19:32.047', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 17, 65, 'admin@hr.com', '2026-08-20 04:19:32.050', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 9, 27, 'admin@hr.com', '2026-08-24 02:20:06.608', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 9, 28, 'admin@hr.com', '2026-08-24 02:20:06.611', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 1, 'admin@hr.com', '2026-08-24 02:20:06.614', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 1, 'admin@hr.com', '2026-08-24 02:20:06.615', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 2, 'admin@hr.com', '2026-08-24 02:20:06.617', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 3, 'admin@hr.com', '2026-08-24 02:20:06.627', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 4, 'admin@hr.com', '2026-08-24 02:20:06.629', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 5, 'admin@hr.com', '2026-08-24 02:20:06.631', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 6, 'admin@hr.com', '2026-08-24 02:20:06.634', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 3, 7, 'admin@hr.com', '2026-08-24 02:20:06.638', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 3, 8, 'admin@hr.com', '2026-08-24 02:20:06.640', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 4, 9, 'admin@hr.com', '2026-08-24 02:20:06.642', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 4, 10, 'admin@hr.com', '2026-08-24 02:20:06.645', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 12, 'admin@hr.com', '2026-08-24 02:20:06.647', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 13, 'admin@hr.com', '2026-08-24 02:20:06.649', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 14, 'admin@hr.com', '2026-08-24 02:20:06.651', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 15, 'admin@hr.com', '2026-08-24 02:20:06.655', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 16, 'admin@hr.com', '2026-08-24 02:20:06.658', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 30, 'admin@hr.com', '2026-08-24 02:20:06.660', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 31, 'admin@hr.com', '2026-08-24 02:20:06.663', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 32, 'admin@hr.com', '2026-08-24 02:20:06.665', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 33, 'admin@hr.com', '2026-08-24 02:20:06.667', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 17, 43, 'admin@hr.com', '2026-08-24 02:20:06.669', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 17, 'admin@hr.com', '2026-08-24 02:20:06.672', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 21, 47, 'admin@hr.com', '2026-08-24 02:20:06.675', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 21, 46, 'admin@hr.com', '2026-08-24 02:20:06.677', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 18, 'admin@hr.com', '2026-08-24 02:20:06.679', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 51, 'admin@hr.com', '2026-08-24 02:20:06.681', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 54, 'admin@hr.com', '2026-08-24 02:20:06.684', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 55, 'admin@hr.com', '2026-08-24 02:20:06.686', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 10, 29, 'admin@hr.com', '2026-08-24 02:20:06.689', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 10, 56, 'admin@hr.com', '2026-08-24 02:20:06.691', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 19, 'admin@hr.com', '2026-08-24 02:20:06.693', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 20, 'admin@hr.com', '2026-08-24 02:20:06.695', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 22, 'admin@hr.com', '2026-08-24 02:20:06.697', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 21, 'admin@hr.com', '2026-08-24 02:20:06.700', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 66, 'admin@hr.com', '2026-08-24 02:20:06.702', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 67, 'admin@hr.com', '2026-08-24 02:20:06.704', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 18, 'admin@hr.com', '2026-08-20 10:05:04.381', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 19, 'admin@hr.com', '2026-08-20 10:05:04.385', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 20, 'admin@hr.com', '2026-08-20 10:05:04.392', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 21, 'admin@hr.com', '2026-08-20 10:05:04.399', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 22, 'admin@hr.com', '2026-08-20 10:05:04.401', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 9, 27, 'admin@hr.com', '2026-08-20 10:05:04.404', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 9, 28, 'admin@hr.com', '2026-08-20 10:05:04.406', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 10, 29, 'admin@hr.com', '2026-08-20 10:05:04.409', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 17, 43, 'admin@hr.com', '2026-08-20 10:05:04.410', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 9, 'admin@hr.com', '2026-08-20 10:05:04.413', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 10, 'admin@hr.com', '2026-08-20 10:05:04.415', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 11, 'admin@hr.com', '2026-08-20 10:05:04.418', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 52, 'admin@hr.com', '2026-08-20 10:05:04.421', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 12, 'admin@hr.com', '2026-08-20 10:05:04.423', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 14, 'admin@hr.com', '2026-08-20 10:05:04.425', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 13, 'admin@hr.com', '2026-08-20 10:05:04.428', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 15, 'admin@hr.com', '2026-08-20 10:05:04.430', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 16, 'admin@hr.com', '2026-08-20 10:05:04.436', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 17, 'admin@hr.com', '2026-08-20 10:05:04.438', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 14, 40, 'admin@hr.com', '2026-08-20 10:05:04.441', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 1, 1, 'admin@hr.com', '2026-08-20 10:05:04.443', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 2, 1, 'admin@hr.com', '2026-08-20 10:05:04.444', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 21, 47, 'admin@hr.com', '2026-08-20 10:05:04.446', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 21, 46, 'admin@hr.com', '2026-08-20 10:05:04.448', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 2, 2, 'admin@hr.com', '2026-08-20 10:05:04.450', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 8, 23, 'admin@hr.com', '2026-08-20 10:05:04.453', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 1, 54, 'admin@hr.com', '2026-08-20 10:05:04.456', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 10, 56, 'admin@hr.com', '2026-08-20 10:05:04.458', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 51, 'admin@hr.com', '2026-08-20 10:05:04.460', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 63, 'admin@hr.com', '2026-08-20 10:05:04.463', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 66, 'admin@hr.com', '2026-08-20 10:05:04.465', NULL, NULL);

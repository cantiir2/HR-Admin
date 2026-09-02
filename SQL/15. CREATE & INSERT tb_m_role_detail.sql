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

INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 36, 'admin@hr.com', '2026-08-24 02:18:47.029', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 37, 'admin@hr.com', '2026-08-24 02:18:47.042', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 6, 'admin@hr.com', '2026-08-24 02:18:47.045', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 35, 'admin@hr.com', '2026-08-24 02:18:47.047', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 5, 'admin@hr.com', '2026-08-24 02:18:47.050', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 50, 'admin@hr.com', '2026-08-24 02:18:47.052', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 51, 'admin@hr.com', '2026-08-24 02:18:47.055', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 21, 46, 'admin@hr.com', '2026-08-24 02:18:47.057', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 21, 47, 'admin@hr.com', '2026-08-24 02:18:47.060', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 1, 1, 'admin@hr.com', '2026-08-24 02:18:47.062', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 1, 'admin@hr.com', '2026-08-24 02:18:47.064', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 2, 'admin@hr.com', '2026-08-24 02:18:47.066', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 4, 'admin@hr.com', '2026-08-24 02:18:47.068', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 3, 7, 'admin@hr.com', '2026-08-24 02:18:47.071', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 3, 8, 'admin@hr.com', '2026-08-24 02:18:47.073', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 9, 'admin@hr.com', '2026-08-24 02:18:47.075', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 10, 'admin@hr.com', '2026-08-24 02:18:47.078', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 11, 'admin@hr.com', '2026-08-24 02:18:47.080', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 12, 'admin@hr.com', '2026-08-24 02:18:47.083', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 13, 'admin@hr.com', '2026-08-24 02:18:47.085', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 5, 14, 'admin@hr.com', '2026-08-24 02:18:47.087', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 15, 'admin@hr.com', '2026-08-24 02:18:47.089', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 16, 'admin@hr.com', '2026-08-24 02:18:47.091', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 17, 'admin@hr.com', '2026-08-24 02:18:47.094', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 18, 'admin@hr.com', '2026-08-24 02:18:47.096', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 19, 'admin@hr.com', '2026-08-24 02:18:47.098', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 20, 'admin@hr.com', '2026-08-24 02:18:47.100', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 21, 'admin@hr.com', '2026-08-24 02:18:47.102', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 22, 'admin@hr.com', '2026-08-24 02:18:47.104', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 23, 'admin@hr.com', '2026-08-24 02:18:47.106', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 24, 'admin@hr.com', '2026-08-24 02:18:47.109', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 25, 'admin@hr.com', '2026-08-24 02:18:47.111', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 8, 26, 'admin@hr.com', '2026-08-24 02:18:47.114', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 9, 27, 'admin@hr.com', '2026-08-24 02:18:47.116', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 9, 28, 'admin@hr.com', '2026-08-24 02:18:47.118', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 10, 29, 'admin@hr.com', '2026-08-24 02:18:47.120', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 30, 'admin@hr.com', '2026-08-24 02:18:47.123', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 31, 'admin@hr.com', '2026-08-24 02:18:47.125', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 32, 'admin@hr.com', '2026-08-24 02:18:47.128', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 11, 33, 'admin@hr.com', '2026-08-24 02:18:47.131', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 20, 34, 'admin@hr.com', '2026-08-24 02:18:47.133', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 4, 52, 'admin@hr.com', '2026-08-24 02:18:47.135', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 1, 54, 'admin@hr.com', '2026-08-24 02:18:47.137', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 10, 56, 'admin@hr.com', '2026-08-24 02:18:47.139', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 6, 62, 'admin@hr.com', '2026-08-24 02:18:47.141', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 7, 66, 'admin@hr.com', '2026-08-24 02:18:47.143', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(1, 1, 2, 67, 'admin@hr.com', '2026-08-24 02:18:47.146', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 18, 'admin@fujitsu.com', '2026-09-01 09:22:25.080', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 19, 'admin@fujitsu.com', '2026-09-01 09:22:25.132', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 20, 'admin@fujitsu.com', '2026-09-01 09:22:25.152', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 21, 'admin@fujitsu.com', '2026-09-01 09:22:25.172', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 22, 'admin@fujitsu.com', '2026-09-01 09:22:25.192', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 9, 27, 'admin@fujitsu.com', '2026-09-01 09:22:25.212', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 9, 28, 'admin@fujitsu.com', '2026-09-01 09:22:25.232', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 10, 29, 'admin@fujitsu.com', '2026-09-01 09:22:25.252', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 17, 43, 'admin@fujitsu.com', '2026-09-01 09:22:25.275', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 9, 'admin@fujitsu.com', '2026-09-01 09:22:25.295', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 10, 'admin@fujitsu.com', '2026-09-01 09:22:25.315', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 11, 'admin@fujitsu.com', '2026-09-01 09:22:25.362', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 4, 52, 'admin@fujitsu.com', '2026-09-01 09:22:25.387', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 12, 'admin@fujitsu.com', '2026-09-01 09:22:25.407', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 14, 'admin@fujitsu.com', '2026-09-01 09:22:25.427', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 13, 'admin@fujitsu.com', '2026-09-01 09:22:25.447', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 15, 'admin@fujitsu.com', '2026-09-01 09:22:25.467', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 16, 'admin@fujitsu.com', '2026-09-01 09:22:25.489', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 6, 17, 'admin@fujitsu.com', '2026-09-01 09:22:25.515', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 14, 40, 'admin@fujitsu.com', '2026-09-01 09:22:25.545', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 1, 1, 'admin@fujitsu.com', '2026-09-01 09:22:25.567', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 2, 1, 'admin@fujitsu.com', '2026-09-01 09:22:25.585', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 21, 47, 'admin@fujitsu.com', '2026-09-01 09:22:25.602', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 21, 46, 'admin@fujitsu.com', '2026-09-01 09:22:25.622', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 2, 2, 'admin@fujitsu.com', '2026-09-01 09:22:25.642', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 8, 23, 'admin@fujitsu.com', '2026-09-01 09:22:25.666', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 1, 54, 'admin@fujitsu.com', '2026-09-01 09:22:25.690', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 10, 56, 'admin@fujitsu.com', '2026-09-01 09:22:25.710', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 51, 'admin@fujitsu.com', '2026-09-01 09:22:25.730', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 5, 63, 'admin@fujitsu.com', '2026-09-01 09:22:25.750', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 7, 66, 'admin@fujitsu.com', '2026-09-01 09:22:25.770', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(3, 1, 3, 7, 'admin@fujitsu.com', '2026-09-01 09:22:25.790', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 38, 'admin@fujitsu.com', '2026-09-01 09:26:33.625', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 13, 39, 'admin@fujitsu.com', '2026-09-01 09:26:33.646', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 14, 40, 'admin@fujitsu.com', '2026-09-01 09:26:33.670', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 15, 41, 'admin@fujitsu.com', '2026-09-01 09:26:33.702', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 16, 42, 'admin@fujitsu.com', '2026-09-01 09:26:33.722', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 17, 43, 'admin@fujitsu.com', '2026-09-01 09:26:33.742', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 19, 45, 'admin@fujitsu.com', '2026-09-01 09:26:33.762', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 21, 45, 'admin@fujitsu.com', '2026-09-01 09:26:33.780', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 57, 'admin@fujitsu.com', '2026-09-01 09:26:33.798', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 59, 'admin@fujitsu.com', '2026-09-01 09:26:33.818', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 60, 'admin@fujitsu.com', '2026-09-01 09:26:33.842', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 61, 'admin@fujitsu.com', '2026-09-01 09:26:33.882', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 12, 64, 'admin@fujitsu.com', '2026-09-01 09:26:33.902', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 17, 65, 'admin@fujitsu.com', '2026-09-01 09:26:33.921', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(4, 1, 13, 68, 'admin@fujitsu.com', '2026-09-01 09:26:33.946', '', NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 9, 27, 'admin@hr.com', '2026-09-02 02:48:16.987', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 9, 28, 'admin@hr.com', '2026-09-02 02:48:17.015', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 1, 'admin@hr.com', '2026-09-02 02:48:17.017', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 1, 'admin@hr.com', '2026-09-02 02:48:17.019', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 2, 'admin@hr.com', '2026-09-02 02:48:17.022', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 3, 'admin@hr.com', '2026-09-02 02:48:17.024', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 4, 'admin@hr.com', '2026-09-02 02:48:17.026', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 5, 'admin@hr.com', '2026-09-02 02:48:17.028', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 6, 'admin@hr.com', '2026-09-02 02:48:17.031', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 3, 7, 'admin@hr.com', '2026-09-02 02:48:17.034', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 3, 8, 'admin@hr.com', '2026-09-02 02:48:17.036', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 4, 9, 'admin@hr.com', '2026-09-02 02:48:17.038', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 4, 10, 'admin@hr.com', '2026-09-02 02:48:17.040', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 12, 'admin@hr.com', '2026-09-02 02:48:17.042', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 13, 'admin@hr.com', '2026-09-02 02:48:17.044', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 5, 14, 'admin@hr.com', '2026-09-02 02:48:17.046', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 15, 'admin@hr.com', '2026-09-02 02:48:17.049', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 16, 'admin@hr.com', '2026-09-02 02:48:17.051', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 30, 'admin@hr.com', '2026-09-02 02:48:17.053', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 31, 'admin@hr.com', '2026-09-02 02:48:17.055', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 32, 'admin@hr.com', '2026-09-02 02:48:17.058', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 11, 33, 'admin@hr.com', '2026-09-02 02:48:17.060', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 17, 43, 'admin@hr.com', '2026-09-02 02:48:17.062', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 17, 'admin@hr.com', '2026-09-02 02:48:17.064', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 21, 47, 'admin@hr.com', '2026-09-02 02:48:17.066', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 21, 46, 'admin@hr.com', '2026-09-02 02:48:17.069', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 18, 'admin@hr.com', '2026-09-02 02:48:17.071', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 51, 'admin@hr.com', '2026-09-02 02:48:17.073', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 54, 'admin@hr.com', '2026-09-02 02:48:17.076', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 1, 55, 'admin@hr.com', '2026-09-02 02:48:17.078', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 10, 29, 'admin@hr.com', '2026-09-02 02:48:17.080', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 10, 56, 'admin@hr.com', '2026-09-02 02:48:17.082', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 19, 'admin@hr.com', '2026-09-02 02:48:17.084', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 20, 'admin@hr.com', '2026-09-02 02:48:17.087', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 22, 'admin@hr.com', '2026-09-02 02:48:17.089', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 21, 'admin@hr.com', '2026-09-02 02:48:17.092', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 7, 66, 'admin@hr.com', '2026-09-02 02:48:17.094', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 2, 67, 'admin@hr.com', '2026-09-02 02:48:17.104', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 69, 'admin@hr.com', '2026-09-02 02:48:17.109', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 70, 'admin@hr.com', '2026-09-02 02:48:17.111', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 6, 71, 'admin@hr.com', '2026-09-02 02:48:17.113', NULL, NULL);
INSERT INTO public.tb_m_role_detail (role_id, application_id, function_id, feature_id, created_by, created_dt, changed_by, changed_dt) VALUES(2, 1, 4, 52, 'admin@hr.com', '2026-09-02 02:48:17.115', NULL, NULL);
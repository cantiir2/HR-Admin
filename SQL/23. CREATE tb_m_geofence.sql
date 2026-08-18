-- public.tb_m_geofence definition
-- Drop table
-- DROP TABLE public.tb_m_geofence;

create table public.tb_m_geofence ( id text not null,
"name" text not null,
description text null,
"location" text null,
latitude float8 null,
longitude float8 null,
"isActive" bool default true not null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
constraint tb_m_geofence_pkey primary key (id));

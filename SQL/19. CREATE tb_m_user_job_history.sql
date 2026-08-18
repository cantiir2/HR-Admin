-- public.tb_m_user_job_history definition
-- Drop table
-- DROP TABLE public.tb_m_user_job_history;

create table public.tb_m_user_job_history ( id text not null,
"userId" text not null,
"companyName" text not null,
"jobTitle" text not null,
description text null,
"startDate" date null,
"endDate" date null,
"isPresent" bool default false not null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
constraint tb_m_user_job_history_pkey primary key (id));

create index "tb_m_user_job_history_userId_idx" on
public.tb_m_user_job_history
    using btree ("userId");
-- public.tb_m_user_job_history foreign keys

alter table public.tb_m_user_job_history add constraint "tb_m_user_job_history_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

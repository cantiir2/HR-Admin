-- public.tb_t_working_report definition
-- Drop table
-- DROP TABLE public.tb_t_working_report;

create table public.tb_t_working_report ( id text not null,
"userId" text not null,
"month" int4 not null,
"year" int4 not null,
status public."WorkingReportStatus" default 'DRAFT'::"WorkingReportStatus" not null,
"submittedAt" timestamp(3) null,
"approvedAt" timestamp(3) null,
"approvedById" text null,
"rejectedAt" timestamp(3) null,
"rejectedById" text null,
"rejectionReason" text null,
"isLate" bool default false not null,
"lateDays" int4 default 0 not null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
constraint tb_t_working_report_pkey primary key (id));

create index tb_t_working_report_status_month_year_idx on
public.tb_t_working_report
    using btree (status,
month,
year);

create unique index "tb_t_working_report_userId_month_year_key" on
public.tb_t_working_report
    using btree ("userId",
month,
year);
-- public.tb_t_working_report foreign keys

alter table public.tb_t_working_report add constraint "tb_t_working_report_approvedById_fkey" foreign key ("approvedById") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_working_report add constraint "tb_t_working_report_rejectedById_fkey" foreign key ("rejectedById") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_working_report add constraint "tb_t_working_report_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

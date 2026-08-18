-- public.tb_t_leave_request definition
-- Drop table
-- DROP TABLE public.tb_t_leave_request;

create table public.tb_t_leave_request ( id text not null,
"userId" text not null,
"contractId" text not null,
"startDate" date not null,
"endDate" date not null,
"totalDays" int4 not null,
reason text not null,
status public."LeaveRequestStatus" default 'PENDING'::"LeaveRequestStatus" not null,
"pmApproverId" text null,
"pmApprovedAt" timestamp(3) null,
"adminApproverId" text null,
"adminApprovedAt" timestamp(3) null,
"rejectedById" text null,
"rejectedAt" timestamp(3) null,
"rejectionReason" text null,
"isOverQuota" bool default false not null,
"overQuotaDays" int4 default 0 not null,
"warningAcknowledged" bool default false not null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
"leaveType" public."LeaveType" default 'ANNUAL_LEAVE'::"LeaveType" not null,
"evidencePhoto" text null,
"evidencePhotoName" text null,
"evidencePhotoMimeType" text null,
constraint tb_t_leave_request_pkey primary key (id));

create index "tb_t_leave_request_contractId_idx" on
public.tb_t_leave_request
    using btree ("contractId");

create index "tb_t_leave_request_userId_status_idx" on
public.tb_t_leave_request
    using btree ("userId",
status);
-- public.tb_t_leave_request foreign keys

alter table public.tb_t_leave_request add constraint "tb_t_leave_request_adminApproverId_fkey" foreign key ("adminApproverId") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_leave_request add constraint "tb_t_leave_request_contractId_fkey" foreign key ("contractId") references public.tb_m_user_contract(id) on
delete
    restrict on
    update
    cascade;

alter table public.tb_t_leave_request add constraint "tb_t_leave_request_pmApproverId_fkey" foreign key ("pmApproverId") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_leave_request add constraint "tb_t_leave_request_rejectedById_fkey" foreign key ("rejectedById") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_leave_request add constraint "tb_t_leave_request_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

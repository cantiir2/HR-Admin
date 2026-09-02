-- public.tb_t_attendance_request definition
-- Drop table
-- DROP TABLE public.tb_t_attendance_request;

create table public.tb_t_attendance_request ( id text not null,
"userId" text not null,
"attendanceId" text null,
"requestDate" date not null,
"requestType" public."AttendanceRequestType" not null,
"requestedCheckInTime" timestamp(3) null,
"requestedCheckOutTime" timestamp(3) null,
reason text not null,
"evidencePhoto" text null,
"evidencePhotoName" text null,
"evidencePhotoMimeType" text null,
status public."AttendanceRequestStatus" default 'PENDING'::"AttendanceRequestStatus" not null,
"approvedById" text null,
"approvedAt" timestamp(3) null,
"declinedById" text null,
"declinedAt" timestamp(3) null,
"declineReason" text null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
constraint tb_t_attendance_request_pkey primary key (id));

create index "tb_t_attendance_request_requestDate_idx" on
public.tb_t_attendance_request
    using btree ("requestDate");

create index "tb_t_attendance_request_userId_status_idx" on
public.tb_t_attendance_request
    using btree ("userId",
status);
-- public.tb_t_attendance_request foreign keys

alter table public.tb_t_attendance_request add constraint "tb_t_attendance_request_approvedById_fkey" foreign key ("approvedById") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_attendance_request add constraint "tb_t_attendance_request_attendanceId_fkey" foreign key ("attendanceId") references public.tb_m_attendance(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_attendance_request add constraint "tb_t_attendance_request_declinedById_fkey" foreign key ("declinedById") references public.tb_m_user(id) on
delete
    set
    null on
    update
    cascade;

alter table public.tb_t_attendance_request add constraint "tb_t_attendance_request_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

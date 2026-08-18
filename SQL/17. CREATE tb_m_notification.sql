-- public.tb_m_notification definition
-- Drop table
-- DROP TABLE public.tb_m_notification;

create table public.tb_m_notification ( id text not null,
"userId" text not null,
"type" public."NotificationType" not null,
title text not null,
message text not null,
"referenceId" text null,
"referenceType" text null,
"isRead" bool default false not null,
"readAt" timestamp(3) null,
channel public."NotificationChannel" default 'BOTH'::"NotificationChannel" not null,
"emailSent" bool default false not null,
"emailSentAt" timestamp(3) null,
"emailError" text null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
constraint tb_m_notification_pkey primary key (id));

create index "tb_m_notification_type_referenceId_idx" on
public.tb_m_notification
    using btree (type,
"referenceId");

create index "tb_m_notification_userId_isRead_createdAt_idx" on
public.tb_m_notification
    using btree ("userId",
"isRead",
"createdAt");
-- public.tb_m_notification foreign keys

alter table public.tb_m_notification add constraint "tb_m_notification_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

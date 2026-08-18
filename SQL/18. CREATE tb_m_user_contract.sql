-- public.tb_m_user_contract definition
-- Drop table
-- DROP TABLE public.tb_m_user_contract;

create table public.tb_m_user_contract ( id text not null,
"userId" text not null,
"contractNumber" text not null,
vendor text not null,
"startDate" date not null,
"endDate" date not null,
"contractValue" numeric(18, 2) not null,
"createdAt" timestamp(3) default CURRENT_TIMESTAMP not null,
"updatedAt" timestamp(3) not null,
constraint tb_m_user_contract_pkey primary key (id));

create unique index "tb_m_user_contract_contractNumber_key" on
public.tb_m_user_contract
    using btree ("contractNumber");

create index "tb_m_user_contract_userId_idx" on
public.tb_m_user_contract
    using btree ("userId");
-- public.tb_m_user_contract foreign keys

alter table public.tb_m_user_contract add constraint "tb_m_user_contract_userId_fkey" foreign key ("userId") references public.tb_m_user(id) on
delete
    cascade on
    update
    cascade;

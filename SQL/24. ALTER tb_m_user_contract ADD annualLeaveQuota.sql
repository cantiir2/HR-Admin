-- Add annualLeaveQuota column to tb_m_user_contract
ALTER TABLE public.tb_m_user_contract
ADD COLUMN IF NOT EXISTS "annualLeaveQuota" integer NOT NULL DEFAULT 12;

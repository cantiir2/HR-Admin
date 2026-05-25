-- public.tb_m_task definition

-- Drop table

-- DROP TABLE public.tb_m_task;

CREATE TABLE public.tb_m_task (
	id text NOT NULL,
	"milestoneId" text NOT NULL,
	"assignedToId" text NULL,
	title text NOT NULL,
	description text NULL,
	status text DEFAULT 'TODO'::text NOT NULL,
	"startDate" timestamp(3) NULL,
	"dueDate" timestamp(3) NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT tb_m_task_pkey PRIMARY KEY (id)
);


-- public.tb_m_task foreign keys

ALTER TABLE public.tb_m_task ADD CONSTRAINT "tb_m_task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.tb_m_user(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.tb_m_task ADD CONSTRAINT "tb_m_task_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES public.tb_m_milestone(id) ON DELETE CASCADE ON UPDATE CASCADE;
-- public.tb_m_milestone definition

-- Drop table

-- DROP TABLE public.tb_m_milestone;

CREATE TABLE public.tb_m_milestone (
	id text NOT NULL,
	"projectId" text NOT NULL,
	"name" text NOT NULL,
	"startDate" timestamp(3) NULL,
	"endDate" timestamp(3) NULL,
	status text DEFAULT 'pending'::text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT tb_m_milestone_pkey PRIMARY KEY (id)
);


-- public.tb_m_milestone foreign keys

ALTER TABLE public.tb_m_milestone ADD CONSTRAINT "tb_m_milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tb_m_project(id) ON DELETE CASCADE ON UPDATE CASCADE;
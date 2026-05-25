-- public.tb_m_project definition

-- Drop table

-- DROP TABLE public.tb_m_project;

CREATE TABLE public.tb_m_project (
	id text NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	"location" text NULL,
	latitude float8 NULL,
	longitude float8 NULL,
	"contractStart" timestamp(3) NOT NULL,
	"contractEnd" timestamp(3) NOT NULL,
	status text DEFAULT 'active'::text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"customerName" text NULL,
	"projectManagerId" text NULL,
	"woNumber" text NULL,
	CONSTRAINT tb_m_project_pkey PRIMARY KEY (id)
);


-- public.tb_m_project foreign keys

ALTER TABLE public.tb_m_project ADD CONSTRAINT "tb_m_project_projectManagerId_fkey" FOREIGN KEY ("projectManagerId") REFERENCES public.tb_m_user(id) ON DELETE SET NULL ON UPDATE CASCADE;
-- public.tb_m_project_member definition

-- Drop table

-- DROP TABLE public.tb_m_project_member;

CREATE TABLE public.tb_m_project_member (
	id text NOT NULL,
	"projectId" text NOT NULL,
	"userId" text NOT NULL,
	"roleInProject" text NULL,
	"joinedAt" date NULL,
	"leftAt" date NULL,
	CONSTRAINT tb_m_project_member_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "tb_m_project_member_projectId_userId_key" ON public.tb_m_project_member USING btree ("projectId", "userId");


-- public.tb_m_project_member foreign keys

ALTER TABLE public.tb_m_project_member ADD CONSTRAINT "tb_m_project_member_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public.tb_m_project(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.tb_m_project_member ADD CONSTRAINT "tb_m_project_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tb_m_user(id) ON DELETE CASCADE ON UPDATE CASCADE;
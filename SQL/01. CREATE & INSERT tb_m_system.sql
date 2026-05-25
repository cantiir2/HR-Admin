-- public.tb_m_system definition

-- Drop table

-- DROP TABLE public.tb_m_system;

CREATE TABLE public.tb_m_system (
	id text NOT NULL,
	category text NOT NULL,
	code text NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	"isActive" bool DEFAULT true NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT tb_m_system_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX tb_m_system_category_code_key ON public.tb_m_system USING btree (category, code);


INSERT INTO public.tb_m_system (id,category,code,"name",description,"isActive","createdAt","updatedAt") VALUES
	 ('bd24c085-be8d-4c9c-935c-6026da31d62e','JOB_ROLE','SA','System Analyst',NULL,true,'2026-05-05 06:36:16.280','2026-05-05 06:36:16.280'),
	 ('4b2dc10d-058b-416a-b746-6a20588ef5d4','JOB_ROLE','PG','Programmer',NULL,true,'2026-05-05 06:36:16.289','2026-05-05 06:36:16.289'),
	 ('e05a51b7-aa81-4b5c-b909-5e62e54d2b4c','JOB_ROLE','PM','Project Manager',NULL,true,'2026-05-05 06:36:16.298','2026-05-05 06:36:16.298'),
	 ('be582f6d-e7af-4803-a112-e9a71113a4b7','JOB_ROLE','QA','Quality Assurance',NULL,true,'2026-05-05 06:36:16.301','2026-05-05 06:36:16.301'),
	 ('1fa979ce-275f-45ed-a81e-f4bce4fcb50e','JOB_ROLE','UI','UI/UX Designer',NULL,true,'2026-05-05 06:36:16.305','2026-05-05 06:36:16.305'),
	 ('fe0115a6-0245-4264-8668-e7b1aab906a1','JOB_ROLE','BA','Business Analyst',NULL,true,'2026-05-05 06:36:16.309','2026-05-05 06:36:16.309'),
	 ('2beaa1c7-8e06-4986-94ae-8690f9c4a064','JOB_ROLE','DO','DevOps Engineer',NULL,true,'2026-05-05 06:36:16.313','2026-05-05 06:36:16.313'),
	 ('a79c8ff5-a080-42c5-b906-7033c3d49d9a','JOB_ROLE','TE','Technical Lead',NULL,true,'2026-05-05 06:36:16.317','2026-05-05 06:36:16.317'),
	 ('ad5847fa-c2d3-4cfe-b311-ca6d7ee5f5fa','RELIGION','KP','Kristen Protestan','',true,'2026-05-06 03:45:14.530','2026-05-06 03:45:14.530'),
	 ('d8f6d92a-e0a4-47d4-8bc8-c6328a2b3ce5','RELIGION','KT','Kristen Katolik','',true,'2026-05-06 03:45:33.297','2026-05-06 03:45:33.297');
INSERT INTO public.tb_m_system (id,category,code,"name",description,"isActive","createdAt","updatedAt") VALUES
	 ('8b39a15f-b22a-4572-a643-a88773ae3069','RELIGION','HI','Hindu','',true,'2026-05-06 03:46:07.891','2026-05-06 03:46:07.891'),
	 ('28d064c1-3377-4fce-a730-3e4b41c6ab25','RELIGION','BU','Buddha','',true,'2026-05-06 03:46:19.520','2026-05-06 03:46:19.520'),
	 ('e12c5c9f-68ab-4aed-a414-60db47a716e2','RELIGION','KHC','Kong Hu Cu','',true,'2026-05-06 03:46:47.604','2026-05-06 03:46:47.604'),
	 ('5a05bfa8-77b3-448f-95d4-61efdae742ff','RELIGION','IS','Islam','',true,'2026-05-06 03:52:16.572','2026-05-06 03:52:16.572'),
	 ('82accfbc-6da1-4c5e-b4e6-bda0ac8a1b5f','BREAK_TIME','01:00','Jam Istirahat','Untuk pengaturan export Break Time',true,'2026-05-07 03:45:04.693','2026-05-07 03:45:04.693');

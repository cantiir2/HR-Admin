-- public.tb_m_user_document definition

-- Drop table

-- DROP TABLE public.tb_m_user_document;

CREATE TABLE public.tb_m_user_document (
	id text NOT NULL,
	"userId" text NOT NULL,
	"fileName" text NOT NULL,
	"fileType" text NULL,
	"fileData" text NOT NULL,
	"documentType" text NOT NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT tb_m_user_document_pkey PRIMARY KEY (id)
);
CREATE INDEX "tb_m_user_document_userId_idx" ON public.tb_m_user_document USING btree ("userId");


-- public.tb_m_user_document foreign keys

ALTER TABLE public.tb_m_user_document ADD CONSTRAINT "tb_m_user_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tb_m_user(id) ON DELETE CASCADE ON UPDATE CASCADE;
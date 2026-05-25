-- public.tb_m_user definition

-- Drop table

-- DROP TABLE public.tb_m_user;

CREATE TYPE public."Role" AS ENUM ('ADMIN', 'MEMBER');

CREATE TABLE public.tb_m_user (
	id text NOT NULL,
	email text NOT NULL,
	"passwordHash" text NOT NULL,
	"name" text NOT NULL,
	"role" public."Role" DEFAULT 'MEMBER'::"Role" NOT NULL,
	"jobRoleCode" text NULL,
	"contractStart" timestamp(3) NULL,
	"contractEnd" timestamp(3) NULL,
	phone text NULL,
	address text NULL,
	"birthDate" timestamp(3) NULL,
	"birthPlace" text NULL,
	gender text NULL,
	religion text NULL,
	"maritalStatus" text NULL,
	education text NULL,
	"cvFile" text NULL,
	"cvFileName" text NULL,
	"profilePhoto" text NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	"emergencyContactName" text NULL,
	"emergencyContactPhone" text NULL,
	"fatherName" text NULL,
	"kkNumberEncrypted" text NULL,
	"ktpNumberEncrypted" text NULL,
	"motherName" text NULL,
	"profilePhotoName" text NULL,
	skill text NULL,
	"workingExperience" text NULL,
	CONSTRAINT tb_m_user_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX tb_m_user_email_key ON public.tb_m_user USING btree (email);


INSERT INTO public.tb_m_user (id,email,"passwordHash","name","role","jobRoleCode","contractStart","contractEnd",phone,address,"birthDate","birthPlace",gender,religion,"maritalStatus",education,"cvFile","cvFileName","profilePhoto","createdAt","updatedAt","emergencyContactName","emergencyContactPhone","fatherName","kkNumberEncrypted","ktpNumberEncrypted","motherName","profilePhotoName",skill,"workingExperience") VALUES
	 ('4de95d8c-ea92-489a-8b61-031ac24a0aec','admin@hr.com','$2b$10$1NdSNCCqlGnAYtF3QzBQq.aBsO20gqSSRYRSACQy5qXHBYiWuE2tS','Administrator','ADMIN'::public."Role",NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-05 06:36:16.233','2026-05-05 06:36:16.233',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
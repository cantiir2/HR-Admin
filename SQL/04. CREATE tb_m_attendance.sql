-- public.tb_m_attendance definition

-- Drop table

-- DROP TABLE public.tb_m_attendance;

CREATE TABLE public.tb_m_attendance (
	id text NOT NULL,
	"userId" text NOT NULL,
	"date" date NOT NULL,
	"checkInTime" timestamp(3) NULL,
	"checkInPhoto" text NULL,
	"checkInLat" float8 NULL,
	"checkInLng" float8 NULL,
	"checkInNote" text NULL,
	"checkOutTime" timestamp(3) NULL,
	"checkOutPhoto" text NULL,
	"checkOutLat" float8 NULL,
	"checkOutLng" float8 NULL,
	"checkOutNote" text NULL,
	"createdAt" timestamp(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp(3) NOT NULL,
	CONSTRAINT tb_m_attendance_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX "tb_m_attendance_userId_date_key" ON public.tb_m_attendance USING btree ("userId", date);


-- public.tb_m_attendance foreign keys

ALTER TABLE public.tb_m_attendance ADD CONSTRAINT "tb_m_attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.tb_m_user(id) ON DELETE CASCADE ON UPDATE CASCADE;
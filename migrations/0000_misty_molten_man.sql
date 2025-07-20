CREATE TABLE "Questionnaire" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" json,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

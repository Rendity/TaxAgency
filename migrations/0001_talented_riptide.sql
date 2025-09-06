CREATE TABLE "short_link" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash" varchar(100) NOT NULL,
	"data" json,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "short_link_hash_unique" UNIQUE("hash")
);

CREATE TABLE "transaction_counters" (
	"prefix" text NOT NULL,
	"date" text NOT NULL,
	"last_number" integer NOT NULL,
	CONSTRAINT "transaction_counters_prefix_date_pk" PRIMARY KEY("prefix","date")
);

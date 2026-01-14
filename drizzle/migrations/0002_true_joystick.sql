ALTER TABLE "products_category" ALTER COLUMN "code" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "refund_transactions" ALTER COLUMN "code" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "code" SET DATA TYPE varchar(16);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "code" varchar(16);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "products_category" ADD CONSTRAINT "products_category_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_code_unique" UNIQUE("code");
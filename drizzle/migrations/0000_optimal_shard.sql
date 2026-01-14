CREATE TABLE "company" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"address" varchar,
	"phone" varchar,
	"img" varchar,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(16),
	"categoryId" integer,
	"name" varchar,
	"normalPrice" integer,
	"hpp" integer,
	"discount" integer,
	"discountType" varchar,
	"stock" integer,
	"active" boolean,
	"available" boolean,
	"img" varchar,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "products_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar,
	"name" varchar,
	"totalProduct" integer,
	"status" boolean,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "refund_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar,
	"transactionId" integer,
	"status" varchar,
	"note" varchar,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer,
	"sales" integer,
	"income" integer,
	"grossIncome" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction_print" (
	"id" serial PRIMARY KEY NOT NULL,
	"transactionId" integer,
	"role" varchar,
	"status" boolean,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"transactionId" integer,
	"productId" integer,
	"qty" integer,
	"subtotal" integer,
	"discount" integer,
	"notes" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar,
	"transactionDate" varchar,
	"createdBy" varchar,
	"userId" integer,
	"transactionType" varchar,
	"customerName" varchar,
	"deliveryType" varchar,
	"tableNumber" varchar,
	"paymentType" varchar,
	"paymentMethod" varchar,
	"paymentStatus" varchar,
	"subtotal" integer,
	"totalDiscount" integer,
	"ppn" integer,
	"bill" integer,
	"payment" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar,
	"role" varchar,
	"username" varchar,
	"password" varchar,
	"active" boolean,
	"lastLogin" timestamp,
	"companyId" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"deletedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_products_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."products_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_print" ADD CONSTRAINT "transaction_print_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_products" ADD CONSTRAINT "transaction_products_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_products" ADD CONSTRAINT "transaction_products_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_company_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
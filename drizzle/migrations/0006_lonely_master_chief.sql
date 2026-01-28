CREATE INDEX "idx_products_name" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_products_stock" ON "products" USING btree ("stock");--> statement-breakpoint
CREATE INDEX "idx_products_id_stock" ON "products" USING btree ("id","stock");--> statement-breakpoint
CREATE INDEX "idx_tc_prefix_date" ON "transaction_counters" USING btree ("prefix","date");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tc_prefix_date" ON "transaction_counters" USING btree ("prefix","date");--> statement-breakpoint
CREATE INDEX "idx_tp_transaction_id" ON "transaction_products" USING btree ("transactionId");--> statement-breakpoint
CREATE INDEX "idx_tp_product_id" ON "transaction_products" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "idx_tp_transaction_product" ON "transaction_products" USING btree ("transactionId","productId");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_id" ON "transactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_transactions_code" ON "transactions" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_transactions_date" ON "transactions" USING btree ("transactionDate");--> statement-breakpoint
CREATE INDEX "idx_transactions_user_date" ON "transactions" USING btree ("userId","transactionDate");
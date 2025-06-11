ALTER TABLE "order_subscription" ADD COLUMN "paypal_order_id" varchar(100);--> statement-breakpoint
ALTER TABLE "order_subscription" ADD COLUMN "paypal_transaction_id" varchar(100);
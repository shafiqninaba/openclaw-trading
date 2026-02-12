-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_reasoning" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "alpaca_order_id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "side" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "strategy" TEXT,
    "stop_loss" DECIMAL,
    "take_profit" DECIMAL,
    "lesson" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trade_reasoning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "symbol" TEXT NOT NULL,
    "notes" TEXT,
    "target_entry" DECIMAL,
    "target_exit" DECIMAL,
    "stop_loss" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'watching',
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "taught_at" DATE NOT NULL,
    "trade_reasoning_id" UUID,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_date_key" ON "journal_entries"("date");

-- CreateIndex
CREATE UNIQUE INDEX "trade_reasoning_alpaca_order_id_key" ON "trade_reasoning"("alpaca_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_symbol_key" ON "watchlist"("symbol");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_trade_reasoning_id_fkey" FOREIGN KEY ("trade_reasoning_id") REFERENCES "trade_reasoning"("id") ON DELETE SET NULL ON UPDATE CASCADE;

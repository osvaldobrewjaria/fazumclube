-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "features" TEXT[],
ADD COLUMN     "highlighted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "interval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "price" DOUBLE PRECISION,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "tagline" TEXT;

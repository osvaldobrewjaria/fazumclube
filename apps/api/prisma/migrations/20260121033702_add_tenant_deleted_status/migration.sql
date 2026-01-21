-- AlterEnum
ALTER TYPE "TenantStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "deletedAt" TIMESTAMP(3);

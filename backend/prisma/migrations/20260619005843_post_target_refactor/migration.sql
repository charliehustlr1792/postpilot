-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Analytics" DROP CONSTRAINT "Analytics_postId_fkey";

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "accountId",
DROP COLUMN "platform",
DROP COLUMN "publishedAt",
DROP COLUMN "scheduledAt",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Analytics" DROP COLUMN "postId",
ADD COLUMN     "postTargetId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."scheduled_jobs" DROP COLUMN "postId",
ADD COLUMN     "postTargetId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."PostTarget" (
    "id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "platformPostId" TEXT,
    "url" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "PostTarget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostTarget_postId_accountId_key" ON "public"."PostTarget"("postId", "accountId");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTarget" ADD CONSTRAINT "PostTarget_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostTarget" ADD CONSTRAINT "PostTarget_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."SocialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_postTargetId_fkey" FOREIGN KEY ("postTargetId") REFERENCES "public"."PostTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- CreateTable
CREATE TABLE "Example" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "discriminator" TEXT,
    "verified" BOOLEAN NOT NULL,
    "discordId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "TSWAccount" (
    "account" TEXT NOT NULL,
    "verificationCode" TEXT,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "Characters" (
    "name" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "schc" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ladder" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Characters_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ItemListing" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "currencyType" TEXT NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "ItemListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Items" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "column" INTEGER,
    "row" INTEGER,
    "image" TEXT,
    "type" TEXT,
    "ilvl_original" INTEGER,
    "ilvl" INTEGER,
    "quality" INTEGER,
    "quality_str" TEXT,
    "is_ethereal" BOOLEAN,
    "is_rw" BOOLEAN,
    "storage" INTEGER,
    "socket_count" INTEGER,
    "socketed_count" INTEGER,
    "is_class_charm" BOOLEAN,
    "is_charm" BOOLEAN,
    "has_trophy" BOOLEAN,
    "is_upgraded" BOOLEAN,
    "equipment" INTEGER,
    "is_trophy_fragment" BOOLEAN,
    "is_enhanced_rw" BOOLEAN,
    "complete_description" TEXT NOT NULL,
    "name_idxs" TEXT,
    "name_complete_idxs" TEXT,
    "name_special_idxs" TEXT,
    "pull_ts" TIMESTAMP NOT NULL,

    CONSTRAINT "Items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenericRolls" (
    "roll" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Complete_Description" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "color" INTEGER NOT NULL,
    "addLineBreak" BOOLEAN NOT NULL,
    "genericRollText" TEXT,
    "valuesCount" BIGINT,
    "valuesOne" BIGINT,
    "valuesTwo" BIGINT,
    "valuesThree" BIGINT,
    "valuesFour" BIGINT,
    "valuesFive" BIGINT,

    CONSTRAINT "Complete_Description_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "params" JSONB NOT NULL,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TG" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TGTransaction" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "itemsId" TEXT,

    CONSTRAINT "TGTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "TSWAccount_account_key" ON "TSWAccount"("account");

-- CreateIndex
CREATE UNIQUE INDEX "Characters_name_key" ON "Characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ItemListing_id_key" ON "ItemListing"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GenericRolls_roll_key" ON "GenericRolls"("roll");

-- CreateIndex
CREATE UNIQUE INDEX "Complete_Description_id_key" ON "Complete_Description"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TG_id_key" ON "TG"("id");

-- CreateIndex
CREATE UNIQUE INDEX "TGTransaction_id_key" ON "TGTransaction"("id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TSWAccount" ADD CONSTRAINT "TSWAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Characters" ADD CONSTRAINT "Characters_account_fkey" FOREIGN KEY ("account") REFERENCES "TSWAccount"("account") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemListing" ADD CONSTRAINT "ItemListing_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Characters"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complete_Description" ADD CONSTRAINT "Complete_Description_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TG" ADD CONSTRAINT "TG_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TGTransaction" ADD CONSTRAINT "TGTransaction_itemsId_fkey" FOREIGN KEY ("itemsId") REFERENCES "Items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TGTransaction" ADD CONSTRAINT "TGTransaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "TG"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TGTransaction" ADD CONSTRAINT "TGTransaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "TG"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateDocsRecipientTableAndCreateCounterpartiesTable1717072539890
	implements MigrationInterface
{
	name = "UpdateDocsRecipientTableAndCreateCounterpartiesTable1717072539890"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."counterparties_type_enum" AS ENUM('ЮЛ', 'ИП', 'ФЛ')`
		)
		await queryRunner.query(
			`CREATE TABLE "counterparties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "full_name" character varying NOT NULL, "inn" character varying(12) NOT NULL, "kpp" character varying(9) NOT NULL, "type" "public"."counterparties_type_enum" NOT NULL, "is_cancel" boolean NOT NULL DEFAULT false, "modified_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9f045dc184ca2426af5e9dfb13b" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP COLUMN "created_at"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP COLUMN "updated_at"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP COLUMN "deleted_at"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "PK_e254393183c20d60aac715a1409"`
		)
		await queryRunner.query(`ALTER TABLE "docs_recipient" DROP COLUMN "id"`)
		await queryRunner.query(`ALTER TABLE "docs_recipient" DROP COLUMN "ka_id"`)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "counterparties_id" uuid NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "PK_52aaefa7b0fd8c86f1a6c2cbf1c" PRIMARY KEY ("counterparties_id")`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."counterparties_id" IS 'ID контрагента'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "PK_52aaefa7b0fd8c86f1a6c2cbf1c"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "PK_472db5a72b5f57be1c29e6f9c87" PRIMARY KEY ("docs_id", "counterparties_id")`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" DROP DEFAULT`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "FK_4abe471cd9ddb570062223bb208"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."docs_id" IS 'ID документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."order" IS 'порядок подписания'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "FK_4abe471cd9ddb570062223bb208" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "FK_52aaefa7b0fd8c86f1a6c2cbf1c" FOREIGN KEY ("counterparties_id") REFERENCES "counterparties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "FK_52aaefa7b0fd8c86f1a6c2cbf1c"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "FK_4abe471cd9ddb570062223bb208"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."order" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."docs_id" IS NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "FK_4abe471cd9ddb570062223bb208" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_template" SET DEFAULT false`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "PK_472db5a72b5f57be1c29e6f9c87"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "PK_52aaefa7b0fd8c86f1a6c2cbf1c" PRIMARY KEY ("counterparties_id")`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs_recipient"."counterparties_id" IS 'ID контрагента'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP CONSTRAINT "PK_52aaefa7b0fd8c86f1a6c2cbf1c"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" DROP COLUMN "counterparties_id"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "ka_id" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD CONSTRAINT "PK_e254393183c20d60aac715a1409" PRIMARY KEY ("id")`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "deleted_at" TIMESTAMP`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`
		)
		await queryRunner.query(
			`ALTER TABLE "docs_recipient" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
		)
		await queryRunner.query(`DROP TABLE "counterparties"`)
		await queryRunner.query(`DROP TYPE "public"."counterparties_type_enum"`)
	}
}

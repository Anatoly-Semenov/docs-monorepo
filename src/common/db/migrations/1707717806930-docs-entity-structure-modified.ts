import { MigrationInterface, QueryRunner } from "typeorm"

export class DocsEntityStructureModified1707717806930
	implements MigrationInterface
{
	name = "DocsEntityStructureModified1707717806930"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "post_id"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "inn" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "created_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "updated_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "deleted_by" character varying`
		)
		await queryRunner.query(
			`ALTER TABLE "systems" ALTER COLUMN "message" DROP NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "document_kind"`)
		await queryRunner.query(
			`CREATE TYPE "public"."files_document_kind_enum" AS ENUM('Договор')`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "document_kind" "public"."files_document_kind_enum" NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_20c69af02b0c5a090b1c068595f"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "entity_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "messages_id" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "packet_id" DROP NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "document_kind"`)
		await queryRunner.query(
			`CREATE TYPE "public"."docs_document_kind_enum" AS ENUM('Договор')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "document_kind" "public"."docs_document_kind_enum" NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_send" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "link_diadoc" DROP NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "REL_20c69af02b0c5a090b1c068595"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_20c69af02b0c5a090b1c068595f" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_20c69af02b0c5a090b1c068595f"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "REL_20c69af02b0c5a090b1c068595" UNIQUE ("system_id")`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "link_diadoc" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "is_send" SET NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "document_kind"`)
		await queryRunner.query(`DROP TYPE "public"."docs_document_kind_enum"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "document_kind" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "packet_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "messages_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "entity_id" SET NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_20c69af02b0c5a090b1c068595f" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "document_kind"`)
		await queryRunner.query(`DROP TYPE "public"."files_document_kind_enum"`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "document_kind" character varying NOT NULL`
		)
		await queryRunner.query(
			`ALTER TABLE "systems" ALTER COLUMN "message" SET NOT NULL`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "deleted_by"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "updated_by"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "created_by"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "inn"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "post_id" character varying NOT NULL`
		)
	}
}

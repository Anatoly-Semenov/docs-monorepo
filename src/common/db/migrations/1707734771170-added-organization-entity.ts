import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedOrganizationEntity1707734771170
	implements MigrationInterface
{
	name = "AddedOrganizationEntity1707734771170"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."organizations_type_enum" AS ENUM('ЮЛ', 'ИП', 'ФЛ')`
		)
		await queryRunner.query(
			`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "org_id" character varying NOT NULL, "name" character varying NOT NULL, "full_name" character varying NOT NULL, "inn" character varying NOT NULL, "kpp" character varying NOT NULL, "box_id" character varying NOT NULL, "type" "public"."organizations_type_enum" NOT NULL, "fns_participant_id" character varying NOT NULL, CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "organizations"`)
		await queryRunner.query(`DROP TYPE "public"."organizations_type_enum"`)
	}
}

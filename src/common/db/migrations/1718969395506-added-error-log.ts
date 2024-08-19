import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedErrorLog1718969395506 implements MigrationInterface {
	name = "AddedErrorLog1718969395506"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "error_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "doc_id" character varying NOT NULL, "errors" character varying, CONSTRAINT "PK_6840885d7eb78406fa7d358be72" PRIMARY KEY ("id"))`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "error_logs"`)
	}
}

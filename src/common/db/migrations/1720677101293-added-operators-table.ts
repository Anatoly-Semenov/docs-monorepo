import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedOperatorsTable1720677101293 implements MigrationInterface {
	name = "AddedOperatorsTable1720677101293"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "operators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fns_id" character varying NOT NULL, "name" character varying NOT NULL, "is_active" boolean NOT NULL, CONSTRAINT "UQ_9921a0cfef25bcad9da430d41c9" UNIQUE ("fns_id"), CONSTRAINT "PK_3d02b3692836893720335a79d1b" PRIMARY KEY ("id"))`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "operators"`)
	}
}

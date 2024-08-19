import { MigrationInterface, QueryRunner } from "typeorm"

export class DeleteLogsTable1718887916817 implements MigrationInterface {
	name = "DeleteLogsTable1718887916817"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`DROP TABLE "logs"`)
		await queryRunner.query(`DROP TYPE "public"."logs_http_method_enum"`)
		await queryRunner.query(`DROP TYPE "public"."logs_log_type_enum"`)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."logs_log_type_enum" AS ENUM('request', 'response', 'error')`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."logs_http_method_enum" AS ENUM('options', 'delete', 'patch', 'post', 'get', 'put')`
		)
		await queryRunner.query(
			`CREATE TABLE "logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "log_type" "public"."logs_log_type_enum" NOT NULL, "trace_id" uuid NOT NULL, "http_method" "public"."logs_http_method_enum", "path" character varying, "ip" character varying, "status_code" integer, "user_agent" character varying, CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))`
		)
	}
}

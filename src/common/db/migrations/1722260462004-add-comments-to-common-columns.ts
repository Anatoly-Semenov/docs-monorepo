import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCommentsToCommonColumns1722260462004
	implements MigrationInterface
{
	name = "AddCommentsToCommonColumns1722260462004"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`COMMENT ON COLUMN "systems"."id" IS 'Внутренний id сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "systems"."created_at" IS 'Дата создания сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "systems"."updated_at" IS 'Дата внесения изменений в сущность'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "systems"."deleted_at" IS 'Дата удаления сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."id" IS 'Внутренний id сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."created_at" IS 'Дата создания сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."updated_at" IS 'Дата внесения изменений в сущность'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."deleted_at" IS 'Дата удаления сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."system_id" IS 'Внутренний id сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."id" IS 'Внутренний id сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."created_at" IS 'Дата создания сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."updated_at" IS 'Дата внесения изменений в сущность'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."deleted_at" IS 'Дата удаления сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."id" IS 'Внутренний id сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."created_at" IS 'Дата создания сущности'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."updated_at" IS 'Дата внесения изменений в сущность'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."deleted_at" IS 'Дата удаления сущности'`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."deleted_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."updated_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "operators"."created_at" IS NULL`
		)
		await queryRunner.query(`COMMENT ON COLUMN "operators"."id" IS NULL`)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."deleted_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."updated_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "error_logs"."created_at" IS NULL`
		)
		await queryRunner.query(`COMMENT ON COLUMN "error_logs"."id" IS NULL`)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."system_id" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."deleted_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."updated_at" IS NULL`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "admin_users"."created_at" IS NULL`
		)
		await queryRunner.query(`COMMENT ON COLUMN "admin_users"."id" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "systems"."deleted_at" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "systems"."updated_at" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "systems"."created_at" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "systems"."id" IS NULL`)
	}
}

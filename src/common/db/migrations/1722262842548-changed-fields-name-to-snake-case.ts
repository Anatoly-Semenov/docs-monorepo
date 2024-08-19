import { MigrationInterface, QueryRunner } from "typeorm"

export class ChangedFieldsNameToSnakeCase1722262842548
	implements MigrationInterface
{
	name = "ChangedFieldsNameToSnakeCase1722262842548"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isProxyAllowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isLockSendAllowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isApprovementSignaturesAllowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "is_proxy_allowed" boolean`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_proxy_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "is_lock_send_allowed" boolean`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_lock_send_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "is_approvement_signatures_allowed" boolean`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_approvement_signatures_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_approvement_signatures_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "is_approvement_signatures_allowed"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_lock_send_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "is_lock_send_allowed"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "organizations"."is_proxy_allowed" IS 'При значении null выполняется запрос на получение разрешений'`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "is_proxy_allowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isApprovementSignaturesAllowed" boolean`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isLockSendAllowed" boolean`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isProxyAllowed" boolean`
		)
	}
}

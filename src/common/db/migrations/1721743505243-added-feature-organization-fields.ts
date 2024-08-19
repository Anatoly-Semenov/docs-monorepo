import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedFeatureOrganizationFields1721743505243
	implements MigrationInterface
{
	name = "AddedFeatureOrganizationFields1721743505243"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isProxyAllowed" boolean`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isLockSendAllowed" boolean`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" ADD "isApprovementSignaturesAllowed" boolean`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isApprovementSignaturesAllowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isLockSendAllowed"`
		)
		await queryRunner.query(
			`ALTER TABLE "organizations" DROP COLUMN "isProxyAllowed"`
		)
	}
}

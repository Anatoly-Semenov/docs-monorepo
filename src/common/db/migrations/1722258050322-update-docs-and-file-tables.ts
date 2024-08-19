import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateDocsAndFileTables1722258050322
	implements MigrationInterface
{
	name = "UpdateDocsAndFileTables1722258050322"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "currency_code"`)
		await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "total_vat"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "total_vat" double precision`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."total_vat" IS 'Сумма НДС документа, в том числе'`
		)
		await queryRunner.query(`ALTER TABLE "docs" ADD "currency_code" integer`)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."currency_code" IS 'Код валюты'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "need_recipient_signature" boolean DEFAULT false`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."need_recipient_signature" IS 'Флаг, обозначающий запрос подписи получателя под отправляемым документом'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_8165b257d77b3ee28069de7fa46"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_20c69af02b0c5a090b1c068595f"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."doc_id" IS 'ID в системе-источнике'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."messages_id" IS 'ID сообщения в диадок'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."packet_id" IS 'Внешний ключ на ид пакета'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."reg_number" IS 'Регистрационный номер документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."reg_date" IS 'Дата регистрации документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."name" IS 'Наименование документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."document_kind" IS 'Вид документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."sum" IS 'Сумма документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."is_internal" IS 'Признак документа внутри организации'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."is_template" IS 'Признак шаблона'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."is_test" IS 'Признак тестового документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."isRoaming" IS 'Признак роуминга'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."isPublish" IS 'Признак публикации'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."comment" IS 'Комментарий к документу'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."link_contr_system" IS 'Ссылка на карточку документа в системе-источнике'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."link_diadoc" IS 'Ссылка на карточку в diadoc'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."system_id" IS 'Внешний ключ ид системы-источника документа'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."org_id" IS 'Внешний ключ ид организации'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."inn" IS 'ИНН контрагента (Deprecated: в новых документах не используется)'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."created_by" IS 'UUID пользователя или системы'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."updated_by" IS 'UUID пользователя или системы'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."deleted_by" IS 'UUID пользователя или системы'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."link_diadoc_template" IS 'Ссылка на шаблон в диадок'`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."boxes_id" IS 'Список ящиков компаний. Храним массив boxes_id в виде строки через ","'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_8165b257d77b3ee28069de7fa46" FOREIGN KEY ("packet_id") REFERENCES "packets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_20c69af02b0c5a090b1c068595f" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_20c69af02b0c5a090b1c068595f"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_8165b257d77b3ee28069de7fa46"`
		)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."boxes_id" IS NULL`)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."link_diadoc_template" IS NULL`
		)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."deleted_by" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."updated_by" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."created_by" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."inn" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."org_id" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."system_id" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."link_diadoc" IS NULL`)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."link_contr_system" IS NULL`
		)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."comment" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."isPublish" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."isRoaming" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."is_test" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."is_template" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."is_internal" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."sum" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."document_kind" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."name" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."reg_date" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."reg_number" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."packet_id" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."messages_id" IS NULL`)
		await queryRunner.query(`COMMENT ON COLUMN "docs"."doc_id" IS NULL`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_2545f1bd5b39ac7fc1f09e58573" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_20c69af02b0c5a090b1c068595f" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_8165b257d77b3ee28069de7fa46" FOREIGN KEY ("packet_id") REFERENCES "packets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."need_recipient_signature" IS 'Флаг, обозначающий запрос подписи получателя под отправляемым документом'`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP COLUMN "need_recipient_signature"`
		)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."currency_code" IS 'Код валюты'`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "currency_code"`)
		await queryRunner.query(
			`COMMENT ON COLUMN "docs"."total_vat" IS 'Сумма НДС документа, в том числе'`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "total_vat"`)
		await queryRunner.query(
			`ALTER TABLE "files" ADD "total_vat" double precision`
		)
		await queryRunner.query(`ALTER TABLE "files" ADD "currency_code" integer`)
	}
}

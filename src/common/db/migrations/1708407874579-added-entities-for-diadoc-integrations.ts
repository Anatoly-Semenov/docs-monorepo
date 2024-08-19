import { MigrationInterface, QueryRunner } from "typeorm"

export class AddedEntitiesForDiadocIntegrations1708407874579
	implements MigrationInterface
{
	name = "AddedEntitiesForDiadocIntegrations1708407874579"

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user" character varying NOT NULL, "permission" character varying NOT NULL, "position" character varying NOT NULL, "can_be_invited_for_chat" boolean NOT NULL, "user_id" character varying NOT NULL, "login" character varying NOT NULL, "full_name" character varying NOT NULL, "is_registered" boolean NOT NULL, "last_name" character varying NOT NULL, "first_name" character varying NOT NULL, "middle_name" character varying NOT NULL, "org_id" uuid NOT NULL, "department_id" uuid NOT NULL, CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "status" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "docs_id" uuid NOT NULL, "files_id" uuid NOT NULL, "name" character varying NOT NULL, "severity" character varying NOT NULL, "key_status" character varying NOT NULL, "primary_status" boolean NOT NULL, "is_active" boolean NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."packets_lockmode_enum" AS ENUM('None', 'Send', 'Full')`
		)
		await queryRunner.query(
			`CREATE TABLE "packets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "lockmode" "public"."packets_lockmode_enum" NOT NULL, CONSTRAINT "PK_c7624712907ae99a6b2e57779e4" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "inbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exchange_id" uuid NOT NULL, "outbox_id" uuid, "exchange_departments_relation_id" character varying NOT NULL, "entities" character varying NOT NULL, "draft_is_locked" boolean NOT NULL, "draft_is_recycled" boolean NOT NULL, "created_from_draft_id" character varying NOT NULL, "draft_is_transformed_to_message_id_list" text array NOT NULL, "message_type" character varying NOT NULL, "template_to_letter_transformation_info" character varying NOT NULL, "is_reusable" boolean NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "deleted_by" character varying NOT NULL, "exchangeDepartmentsRelationId" uuid, CONSTRAINT "REL_309978f04a948298e07e76b796" UNIQUE ("outbox_id"), CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "exchange" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "counterparty_inn" character varying NOT NULL, "packet_id" uuid NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "deleted_by" character varying NOT NULL, CONSTRAINT "PK_cbd4568fcb476b57cebd8239895" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "exchange_id" uuid NOT NULL, "inbox_id" uuid, "exchange_departments_relation_id" uuid NOT NULL, "is_draft" boolean NOT NULL, "lock_draft" boolean NOT NULL, "strict_draft_validation" boolean NOT NULL, "structured_data_attachments" text array NOT NULL, "document_attachments" text array NOT NULL, "is_internal" boolean NOT NULL, "send_delay" boolean NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, "deleted_by" character varying NOT NULL, CONSTRAINT "REL_4faef852c7d64a40865171f079" UNIQUE ("inbox_id"), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "exchange_departments_relations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "receiver_department_id" uuid, "sender_department_id" uuid NOT NULL, "proxy_department_id" uuid NOT NULL, CONSTRAINT "PK_463ba3fff119a7f37de890a0b66" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`CREATE TABLE "department" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "department_org_id" character varying NOT NULL, "parent_department" character varying, "name" character varying NOT NULL, "abbreviation" character varying, "kpp" character varying NOT NULL, "address" character varying NOT NULL, CONSTRAINT "PK_9a2213262c1593bffb581e382f5" PRIMARY KEY ("id"))`
		)
		await queryRunner.query(
			`ALTER TYPE "public"."files_document_kind_enum" RENAME TO "files_document_kind_enum_old"`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."files_document_kind_enum" AS ENUM('Неформализованный документ', 'Счет-фактура', 'Договор', 'КС2', 'УПД', 'Исправление УПД', 'Корректировочный счет-фактура', 'Исправление корректировочного СФ', 'УКД', 'Исправление УКД')`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "document_kind" TYPE "public"."files_document_kind_enum" USING "document_kind"::"text"::"public"."files_document_kind_enum"`
		)
		await queryRunner.query(`DROP TYPE "public"."files_document_kind_enum_old"`)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "packet_id"`)
		await queryRunner.query(`ALTER TABLE "docs" ADD "packet_id" uuid`)
		await queryRunner.query(
			`ALTER TYPE "public"."docs_document_kind_enum" RENAME TO "docs_document_kind_enum_old"`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."docs_document_kind_enum" AS ENUM('Неформализованный документ', 'Счет-фактура', 'Договор', 'КС2', 'УПД', 'Исправление УПД', 'Корректировочный счет-фактура', 'Исправление корректировочного СФ', 'УКД', 'Исправление УКД')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "document_kind" TYPE "public"."docs_document_kind_enum" USING "document_kind"::"text"::"public"."docs_document_kind_enum"`
		)
		await queryRunner.query(`DROP TYPE "public"."docs_document_kind_enum_old"`)
		await queryRunner.query(
			`ALTER TABLE "employee" ADD CONSTRAINT "FK_6f6589e081719461940c5cf1ee6" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "employee" ADD CONSTRAINT "FK_d62835db8c0aec1d18a5a927549" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_30c1ab87085b2862537b6141ee2" FOREIGN KEY ("docs_id") REFERENCES "docs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "status" ADD CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7" FOREIGN KEY ("files_id") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD CONSTRAINT "FK_8165b257d77b3ee28069de7fa46" FOREIGN KEY ("packet_id") REFERENCES "packets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" ADD CONSTRAINT "FK_de713e439c5a0cdfbd08cd1e5a3" FOREIGN KEY ("exchange_id") REFERENCES "exchange"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" ADD CONSTRAINT "FK_309978f04a948298e07e76b7964" FOREIGN KEY ("outbox_id") REFERENCES "outbox"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" ADD CONSTRAINT "FK_511c2c099c400c366720b8d8ffc" FOREIGN KEY ("exchangeDepartmentsRelationId") REFERENCES "exchange_departments_relations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange" ADD CONSTRAINT "FK_68725e2b96416a8de3279d9e130" FOREIGN KEY ("packet_id") REFERENCES "packets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" ADD CONSTRAINT "FK_ec6234f363d1dcf90ff2baf2b53" FOREIGN KEY ("exchange_id") REFERENCES "exchange"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" ADD CONSTRAINT "FK_4faef852c7d64a40865171f0793" FOREIGN KEY ("inbox_id") REFERENCES "inbox"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" ADD CONSTRAINT "FK_c0730902b3fbc9c47b01c79fd46" FOREIGN KEY ("exchange_departments_relation_id") REFERENCES "exchange_departments_relations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" ADD CONSTRAINT "FK_bbee33501542f74f1b769cc7301" FOREIGN KEY ("receiver_department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" ADD CONSTRAINT "FK_bb1d174b5d7c8125282e134446b" FOREIGN KEY ("sender_department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" ADD CONSTRAINT "FK_d7dd3a17bc18095187ac0f0cd67" FOREIGN KEY ("proxy_department_id") REFERENCES "department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
		)
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" DROP CONSTRAINT "FK_d7dd3a17bc18095187ac0f0cd67"`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" DROP CONSTRAINT "FK_bb1d174b5d7c8125282e134446b"`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange_departments_relations" DROP CONSTRAINT "FK_bbee33501542f74f1b769cc7301"`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" DROP CONSTRAINT "FK_c0730902b3fbc9c47b01c79fd46"`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" DROP CONSTRAINT "FK_4faef852c7d64a40865171f0793"`
		)
		await queryRunner.query(
			`ALTER TABLE "outbox" DROP CONSTRAINT "FK_ec6234f363d1dcf90ff2baf2b53"`
		)
		await queryRunner.query(
			`ALTER TABLE "exchange" DROP CONSTRAINT "FK_68725e2b96416a8de3279d9e130"`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" DROP CONSTRAINT "FK_511c2c099c400c366720b8d8ffc"`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" DROP CONSTRAINT "FK_309978f04a948298e07e76b7964"`
		)
		await queryRunner.query(
			`ALTER TABLE "inbox" DROP CONSTRAINT "FK_de713e439c5a0cdfbd08cd1e5a3"`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" DROP CONSTRAINT "FK_8165b257d77b3ee28069de7fa46"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_3ef1d36b4f53f83d21b404747c7"`
		)
		await queryRunner.query(
			`ALTER TABLE "status" DROP CONSTRAINT "FK_30c1ab87085b2862537b6141ee2"`
		)
		await queryRunner.query(
			`ALTER TABLE "employee" DROP CONSTRAINT "FK_d62835db8c0aec1d18a5a927549"`
		)
		await queryRunner.query(
			`ALTER TABLE "employee" DROP CONSTRAINT "FK_6f6589e081719461940c5cf1ee6"`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."docs_document_kind_enum_old" AS ENUM('Договор')`
		)
		await queryRunner.query(
			`ALTER TABLE "docs" ALTER COLUMN "document_kind" TYPE "public"."docs_document_kind_enum_old" USING "document_kind"::"text"::"public"."docs_document_kind_enum_old"`
		)
		await queryRunner.query(`DROP TYPE "public"."docs_document_kind_enum"`)
		await queryRunner.query(
			`ALTER TYPE "public"."docs_document_kind_enum_old" RENAME TO "docs_document_kind_enum"`
		)
		await queryRunner.query(`ALTER TABLE "docs" DROP COLUMN "packet_id"`)
		await queryRunner.query(
			`ALTER TABLE "docs" ADD "packet_id" character varying`
		)
		await queryRunner.query(
			`CREATE TYPE "public"."files_document_kind_enum_old" AS ENUM('Договор')`
		)
		await queryRunner.query(
			`ALTER TABLE "files" ALTER COLUMN "document_kind" TYPE "public"."files_document_kind_enum_old" USING "document_kind"::"text"::"public"."files_document_kind_enum_old"`
		)
		await queryRunner.query(`DROP TYPE "public"."files_document_kind_enum"`)
		await queryRunner.query(
			`ALTER TYPE "public"."files_document_kind_enum_old" RENAME TO "files_document_kind_enum"`
		)
		await queryRunner.query(`DROP TABLE "department"`)
		await queryRunner.query(`DROP TABLE "exchange_departments_relations"`)
		await queryRunner.query(`DROP TABLE "outbox"`)
		await queryRunner.query(`DROP TABLE "exchange"`)
		await queryRunner.query(`DROP TABLE "inbox"`)
		await queryRunner.query(`DROP TABLE "packets"`)
		await queryRunner.query(`DROP TYPE "public"."packets_lockmode_enum"`)
		await queryRunner.query(`DROP TABLE "status"`)
		await queryRunner.query(`DROP TABLE "employee"`)
	}
}

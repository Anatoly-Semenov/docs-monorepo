import { DataSource } from "typeorm"
import { Seeder, SeederFactoryManager } from "typeorm-extension"

export class OrganizationsSeeder1721741169903 implements Seeder {
	track = false

	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		await dataSource.query(`INSERT INTO "public"."organizations" ("id", "created_at", "updated_at", "deleted_at", "org_id", "name", "full_name", "inn", "kpp", "box_id", "type", "fns_participant_id", "box_id_guid", "is_document_flow", "org_id_diadoc") VALUES
			('4f7f23d0-dac3-11ee-bfce-0050560b6a3c', '2024-03-14 17:41:51.688524', '2024-05-22 17:28:09.486794', NULL, '4f7f23d0-dac3-11ee-bfce-0050560b6a3c', 'Тестовая организация №9280038', 'Тестовая организация №9280038', '9692800387', '969201000', 'c29656050cd041259faa716d963f810b@diadoc.ru', 'ЮЛ', NULL, 'c2965605-0cd0-4125-9faa-716d963f810b', 't', 'f40879ca-0665-4291-90ee-9e56a6142614'),
			('0935a980-dac3-11ee-bfce-0050560b6a2c', '2024-03-05 12:39:14.603029', '2024-05-23 08:54:28.634451', NULL, '0935a980-dac3-11ee-bfce-0050560b6a3c', 'Тестовая организация №4693158', 'Тестовая организация №4693158', '9646931586', '964601000', 'b5bed90b0c844749964d8009199576a3@diadoc.ru', 'ЮЛ', NULL, 'b5bed90b-0c84-4749-964d-8009199576a3', 't', 'f1433521-b1bd-4c90-a3b7-6cfe6cbeb852');
		`)
	}
}

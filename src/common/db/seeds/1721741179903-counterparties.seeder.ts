import { DataSource } from "typeorm"
import { Seeder, SeederFactoryManager } from "typeorm-extension"

export class CounterpartiesSeeder1721741179903 implements Seeder {
	track = false

	public async run(
		dataSource: DataSource,
		factoryManager: SeederFactoryManager
	): Promise<any> {
		await dataSource.query(`INSERT INTO "public"."counterparties" ("id", "name", "full_name", "inn", "kpp", "type", "is_cancel", "modified_at") VALUES
('de1dfe15-dac2-11ee-bfce-0050560b6a3c', 'Тестовая организация №4693158', 'Тестовая организация №4693158', '9646931586', '964601000', 'ЮЛ', 'f', '2024-05-31 14:46:05.104946'),
('33c7ca5f-dac3-11ee-bfce-0050560b6a3c', 'Тестовая организация №9280038', 'Тестовая организация №9280038', '9692800387', '969201000', 'ЮЛ', 'f', '2024-05-31 14:46:05.104946'),
('24f5d4b6-23ce-11ef-bfd0-0050560b6a3c', 'Тестовая организация №5645206', 'Тестовая организация №5645206', '9656452060', '965601000', 'ЮЛ', 'f', '2024-06-06 11:31:51.107214'),
('50504d73-23ce-11ef-bfd0-0050560b6a3c', 'Тестовая организация №5459656', 'Тестовая организация №5459656', '9654596564', '965401000', 'ЮЛ', 'f', '2024-06-06 11:31:51.107214');
		`)
	}
}

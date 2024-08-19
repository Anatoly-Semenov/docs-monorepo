import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"

import { KindFiles } from "@docs/shared/enums/files.enum"

export const docMock = new CreateDocsDto({
	doc_id: "91a0fff3-0f84-4695-9a8a-424036bdf758",
	reg_number: "ДС-2/ 51588",
	reg_date: "2023-04-18",
	name: "СЗ_ГОРОДОК_ЕЭСК_ДС-2_ДОГ-51588_СибТракт_Тех.присоединение",
	document_kind: KindFiles.Contract,
	sum: 123.005,
	is_internal: false,
	need_recipient_signature: false,
	comment: "Договор",
	link_contr_system: "Ссылка на карточку документа в системе-родителе",
	system_id: "91a0fff3-0f84-4695-9a8a-424036bdf758",
	org_id: "91a0fff3-0f84-4695-9a8a-424036bdf758",
	kontragent: [
		"b07be130-7136-415a-8885-8bdcc8dd46c8",
		"8f165246-b0cd-4457-87ac-342c177f8ea4"
	],
	docs_id: [
		"b07be130-7136-415a-8885-8bdcc8dd46c8",
		"8f165246-b0cd-4457-87ac-342c177f8ea4"
	],
	link_files: [
		"Идентификатор(ы) файла(ов)/ссылка на хранилище/сами файлы",
		"Идентификатор(ы) файла(ов)/ссылка на хранилище/сами файлы"
	]
})

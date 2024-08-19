/** Функции для преобразования boxId, UUID, GUID
 * Пример UUID: 2ac6c3c8-ff8e-434e-9a51-10f6b6bf23f2 (в БД box_id_guid)
 * Пример SquashedUuid: 2ac6c3c8ff8e434e9a5110f6b6bf23f2
 * Пример boxId: 2ac6c3c8ff8e434e9a5110f6b6bf23f2@diadoc.ru
 */
export class DiadocGuidBuilder {
	public convertSquashedUuidToUuid(guid: string): string {
		const boxIdParts: string[] = []

		boxIdParts.push(guid.slice(0, 8))
		boxIdParts.push(guid.slice(8, 12))
		boxIdParts.push(guid.slice(12, 16))
		boxIdParts.push(guid.slice(16, 20))
		boxIdParts.push(guid.slice(20))

		return boxIdParts.join("-")
	}

	public convertUuidToSquashedUuid(uuid: string): string {
		return uuid.replaceAll("-", "")
	}

	public convertBoxIdToUuid(boxId: string): string {
		const guidBoxId: string = this.convertBoxIdToSquashedUuid(boxId)

		return this.convertSquashedUuidToUuid(guidBoxId)
	}

	public convertBoxIdToSquashedUuid(boxId: string): string {
		return boxId.split("@")[0]
	}
}

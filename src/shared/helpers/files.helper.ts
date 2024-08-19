import { InternalServerErrorException } from "@nestjs/common"

import { IDiadocFileHeadersData } from "@docs/shared/interfaces/services/db/files-service.interfaces"

/**
 * Функция для извлечения имени файла и diadoc_id
 *   из хедеров ответа Диадок с файлом
 * @param headers
 * @returns { filename, diadocId }
 */
export function GetDiadocFileDataByHeaders(
	headers: IDiadocFileHeader
): IDiadocFileHeadersData {
	try {
		let filenameRaw: string
		const contentDisposition: string = headers["content-disposition"]

		if (contentDisposition.includes('filename="')) {
			filenameRaw = contentDisposition.split('filename="')[1]
		} else {
			filenameRaw = contentDisposition.split("filename=")[1]
		}

		const filename: string = filenameRaw.slice(0, -1)
		const diadocId: string = filename.split(".")[1]

		return {
			filename,
			diadocId
		}
	} catch (e) {
		throw new InternalServerErrorException(
			`Ошибка считывания заголовка content-disposition от Диадок: ${e.message}`
		)
	}
}

interface IDiadocFileHeader {
	"content-disposition": string
}

import { Files } from "@docs/common/db/entities/files.entity"

import { FileDto } from "@docs/shared/dto/v1/db-dto/file/files.dto"

export interface IFilesServiceDb {
	checkDuplicate(fileDto: FileDto): Promise<boolean>
	getById(id: string): Promise<Files>
	update(id: string, dto: any): Promise<Files>
	delete(id: string): Promise<Files>
	getByFilename(filename: string): Promise<Files>
	getPrintFormByDiadocId(diadocId: string): Promise<Files>
	bullSoftDeleteByInstances(
		fileInstances: Files[],
		systemId: string
	): Promise<Files[]>
}

export interface IDiadocFileHeadersData {
	filename: string
	diadocId: string
}

export interface IFileCleanerService {
	deleteOldFiles(): Promise<void>
}

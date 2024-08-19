import { Docs } from "@docs/common/db/entities/docs.entity"
import { Files } from "@docs/common/db/entities/files.entity"

import { IKafkaFactLayerData } from "../client/kafka.interfaces"

import { FileType } from "@docs/shared/enums/files.enum"

export interface IKafkaService {
	sendToKafkaByDoc(docInstance: Docs, fileType: FileType): Promise<boolean>
	sendToKafkaByFile(docInstance: Docs, fileInstance: Files): Promise<boolean>
	prepareData(docInstance: Docs, files: Files[]): IKafkaFactLayerData
	sendUpdateToKafka(preparedKafkaObject: IKafkaFactLayerData): Promise<boolean>
	prepareDeleteByFiles(
		fileInstances: Files[],
		docInstance: Docs
	): IKafkaFactLayerData
	sendDeleteByFiles(fileInstances: Files[], docInstance: Docs): Promise<boolean>
	sendNewDiadocFileToKafka(
		docInstance: Docs,
		fileInstance: Files
	): Promise<boolean>
}

export interface IVgoFields {
	files_links2?: string
	files_links3?: string
}

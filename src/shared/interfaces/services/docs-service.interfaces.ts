import { Docs } from "@docs/common/db/entities/docs.entity"

import { CreateDocsDto } from "@docs/shared/dto/v1/db-dto/docs/create-docs.dto"
import {
	DocPublishResponseDto,
	DocResponseDto
} from "@docs/shared/dto/v1/doc.responses.dto"

import { IDiadocTemplateTransformationInfo } from "@docs/shared/interfaces/client/diadoc.interfaces"

import { IJwtPayloadSystem } from "../jwt-payload.interface"

export interface IDocsService {
	create(
		createDocDto: CreateDocsDto,
		systemPayload: IJwtPayloadSystem
	): Promise<DocResponseDto>
	getById(id: string): Promise<Docs>
	update(
		id: string,
		createDocDto: CreateDocsDto,
		systemPayload: IJwtPayloadSystem
	): Promise<DocResponseDto>
	deleteByDocId(id: string): Promise<DocResponseDto>
	prepareFileForDownloadingFromDiadocId(diadocId: string): Promise<void>
	prepareFilesFromDiadoc(docId: string): Promise<void>
	removeDocumentWithFiles(id: string): Promise<boolean>
	setPublish(
		docId: string,
		systemPayload: IJwtPayloadSystem
	): Promise<DocPublishResponseDto>
	sendToDiadoc(docId: string): Promise<DocPublishResponseDto>
	sendFileUpdateToKafka(diadocId: string, boxIdGuid: string): Promise<boolean>
	setMainLink(id: string): Promise<Docs>
}

export interface IDocumentAttachments {
	NeedRecipientSignature?: boolean
	IsEncrypted?: "true" | "false"
	UnsignedContent?: ISignedContent
	SignedContent?: ISignedContent
	CustomDocumentId: string
	Metadata?: IMetadata[]
	TypeNamedId: string
	Comment: string
}

interface ISignedContent {
	Content: string //base64 file
}

export interface IMetadata {
	Key: string
	Value: string
}

export interface IMetaDataKeys {
	ContractDocumentNumber?: IMetadata
	ContractDocumentDate?: IMetadata
	Grounds?: IMetadata
}

export interface IDiadocStatus {
	Severity: string
	StatusText: string
	StatusHint?: string
	service_status?: string
	mapped_status?: string
}

export interface IDiadocStatusExtended {
	templateTransformationInfo?: IDiadocTemplateTransformationInfo[] | null
	primaryStatus: IDiadocStatus
	counteragentBoxId?: string // boxId контрагента
	isDeleted: boolean
	messageId: string // document message_id
	entityId: string // file diadoc_id
}

/** Kafka interfaces */
export interface IKafkaWrapper {
	id: string
	data: IKafkaData
	trace_data: IKafkaTraceData
}

interface IKafkaTraceData {
	timestamp: string
	trace_id: string
	service_name: "Signing"
}

interface IKafkaData {
	links: string
	state_doc: string
	state_doc_service: null //null
	state_doc_diadoc: null //null
	files_doc: IKafkaFilesDoc[]
}

interface IKafkaFilesDoc {
	files_id: string
	files_links: string
	files_comment: string
	files_state: string
	files_state_service: null //null
}

/** Kafka interfaces */
export interface IKafkaWrapper {
	id: string
	data: IKafkaData
	trace_data: IKafkaTraceData
}

interface IKafkaTraceData {
	timestamp: string
	trace_id: string
	service_name: "Signing"
}

interface IKafkaData {
	links: string
	state_doc: string
	state_doc_service: null //null
	state_doc_diadoc: null //null
	files_doc: IKafkaFilesDoc[]
}

interface IKafkaFilesDoc {
	files_id: string
	files_links: string
	files_comment: string
	files_state: string
	files_state_service: null //null
}

export interface ILinkedDocsDataForUpload {
	storedLinkedDocIds: string[]
	remoteLinkedDocIds: string[]
	hasOnlyRemoteDocs: boolean
}

export interface ICounterpartyData {
	inn?: string[]
	ids?: string[]
}

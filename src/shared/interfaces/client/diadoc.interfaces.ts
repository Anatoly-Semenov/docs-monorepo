import { IDiadocStatus } from "../services/docs-service.interfaces"

import { IDiadocOrganizationContainer } from "../mdm/organizations.interfaces"

import { OrganizationFeature } from "@docs/shared/enums/organization.enum"
import { PacketLockmode } from "@docs/shared/enums/packet.enum"

export interface IInnKppParams {
	inn: string
	kpp?: string
}

/**  Document status updater */
export interface IDiadocStatusUpdateRequestBody {
	PopulatePreviousDocumentStates: boolean
	DocumentDirections: "Outbound"
	Filter: IDiadocStatusUpdateFilter
	AfterIndexKey: string | null
	InjectEntityContent: boolean
	PopulateDocuments: boolean
}

interface IDiadocStatusUpdateFilter {
	FromTimeStamp: IDiadocStatusUpdateTimeStamp
	ToTimeStamp: IDiadocStatusUpdateTimeStamp
}

interface IDiadocStatusUpdateTimeStamp {
	ticks: string
}

export interface IStructuredEventOrganization {
	organizationId: string
	documents: IStructuredEventsDocument[]
}

export interface IStructuredEventsDocument {
	messageId: string
	files: IStructuredEventsFile[]
}

interface IStructuredEventsFile {
	entityId: string
	statuses: IDiadocStatus[]
}

export interface IDiadocTimestamp {
	Ticks: number
}

export interface IDiadocDocumentId {
	MessageId: string
	EntityId: string
}

export interface IDiadocDocumentInfo {
	TemplateInfo: IDiadocTemplateInfo
	DocumentDirection: string
	CounteragentBoxId: string
	FromDepartmentId: string
	ToDepartmentId: string
	DocumentType: string
	Version: string
	IsTest: boolean
}

export interface IDiadocLetterParticipant {
	DepartmentId: string
	BoxId: string
}

export interface IDiadocLetterParticipants {
	Recipient: IDiadocLetterParticipant
	Sender: IDiadocLetterParticipant
	Proxy: IDiadocLetterParticipant
	IsInternal: boolean
}

export interface IDiadocTemplateInfo {
	TemplateTransformationInfos: IDiadocTemplateTransformationInfo[]
	LetterParticipants: IDiadocLetterParticipants
	TransformedToLetterIds: string[]
	IsReusable: boolean
}

export interface IDiadocTemplateTransformationInfo {
	TransformationId: string
	AuthorUserId: string

	TransformedToLetterId: {
		MessageId: string
		EntityId: string
	}
}

export interface IDiadocDocumentFlow {
	CanDocumentBeRevokedUnilaterallyBySender: boolean
	DocflowStatus: { PrimaryStatus: IDiadocStatus }
	DocumentAttachment: object
	DocumentIsDeleted: boolean
	BilateralDocflow: object
	SendTimestamp: object
	DepartmentId: string
	IsFinished: boolean
	CustomData: any[]
}

export interface IDiadocDocument {
	LastEventTimestamp: IDiadocTimestamp
	DocumentInfo: IDiadocDocumentInfo
	SubordinateDocumentIds: any[]
	ForwardDocumentEvents: any[]
	InitialDocumentIds: any[]
	DocumentId: IDiadocDocumentId
	LastEventId: string
	Docflow: IDiadocDocumentFlow
}

export interface IDiadocEvent {
	PreviousDocumentState: object
	DocumentId: IDiadocDocumentId
	Timestamp: IDiadocTimestamp
	PreviousEventId: string
	Document: IDiadocDocument
	IndexKey: string
	EventId: string
}

export interface IDiadocEventData {
	TotalCountType: string
	TotalCount: number
	Events: IDiadocEvent[]
}

export interface IDiadocEventResponse {
	data: IDiadocEventData
}

export interface IDiadocGetOrganizationBoxIdByInnKppResponse {
	data: IDiadocOrganizationContainer
	headers: object
}

export interface IDiadocDataBuffer {
	data: Buffer
}

export interface IDiadocSendResponseWrapper {
	data: IDiadocSendResponse
}

export interface IDiadocTemplateResponse {
	MessageToDepartmentId: string
	Entities: IDiadocEntity[]
	MessageFromBoxId: string
	TimestampTicks: number
	MessageToBoxId: string
	IsReusable: boolean
	MessageId: string
	FromBoxId: string
	IsDeleted: boolean
	LockMode: string
	ToBoxId: string
}

export interface IDiadocSendResponse {
	DraftIsTransformedToMessageIdList: any[]
	LastPatchTimestampTicks: number
	LockMode: PacketLockmode
	CreatedFromDraftId: string
	DraftIsRecycled: boolean
	PacketIsLocked: boolean
	TimestampTicks: number
	DraftIsLocked: boolean
	IsProxified: boolean
	IsInternal: boolean
	MessageType: string
	IsReusable: boolean
	IsDeleted: boolean
	ProxyBoxId: string
	ProxyTitle: string
	MessageId: string
	FromBoxId: string
	FromTitle: string
	IsDraft: boolean
	ToBoxId: string
	ToTitle: string
	IsTest: boolean

	Entities: IDiadocEntity[]
}

export interface IDiadocEntity {
	NeedRecipientSignature: boolean
	IsApprovementSignature: boolean
	IsEncryptedContent: boolean
	Content: { Size: number }
	RawCreationDate: number
	ParentEntityId: string
	AttachmentType: string
	ContentTypeId: string
	AuthorUserId: string
	NeedReceipt: boolean
	EntityType: string
	PacketId?: string
	EntityId: string
	FileName: string
	Version: string
	Labels: any[]

	DocumentInfo: {
		Metadata: { Key: string; Value: string }[]
		LastModificationTimestampTicks: number
		RoamingNotificationStatus: string
		RecipientResponseStatus: string
		CreationTimestampTicks: number
		DeliveryTimestampTicks: number
		SenderSignatureStatus: string
		ProxySignatureStatus: string
		LockMode: PacketLockmode
		HasCustomPrintForm: boolean
		IsEncryptedContent: boolean
		SubordinateDocumentIds: []
		SendTimestampTicks: number
		CounteragentBoxId: string
		Content: { Size: number }
		ForwardDocumentEvents: []
		DocumentDirection: string
		CreationTimestamp: string
		FromDepartmentId: string
		CustomDocumentId: string
		RevocationStatus: string
		EditingSettingId: string
		PacketIsLocked: boolean
		InitialDocumentIds: []
		DocumentNumber: string
		ToDepartmentId: string
		LastOuterDocflows: []
		MessageIdGuid: string
		DocumentType: string
		DocumentDate: string
		DepartmentId: string
		EntityIdGuid: string
		TypeNamedId: string
		IsDeleted: boolean
		WorkflowId: number
		EntityId: string
		FileName: string
		Function: string
		MessageId: string
		IsTest: boolean
		IsRead: boolean
		Version: string
		CustomData: []
		Title: string

		NonformalizedDocumentMetadata: {
			DocumentStatus: string
			ReceiptStatus: string
		}

		RecipientReceiptMetadata: {
			ReceiptStatus: string

			ConfirmationMetadata: {
				ReceiptStatus: string

				ConfirmationMetadata: {
					ReceiptStatus: string
					DateTimeTicks: number
				}
			}
		}

		ConfirmationMetadata: {
			ReceiptStatus: string
			DateTimeTicks: number
		}

		AmendmentRequestMetadata: {
			AmendmentFlags: number
			ReceiptStatus: string
		}

		SenderReceiptMetadata: {
			ReceiptStatus: string
		}

		DocflowStatus: {
			PrimaryStatus: {
				StatusText: string
				Severity: string
			}
		}
	}
}

/** Интерфейсы и типы для запроса GetOrganizationFeatures */
export interface IOrganizationFeaturesWrapper {
	data: IOrganizationFeatures
	headers: object
}
interface IOrganizationFeatures {
	BlockStatus: IOrganizationFeaturesBlockStatus
	Features: OrganizationFeature[]
}

interface IOrganizationFeaturesBlockStatus {
	ManualBlockStatus: IManualBlockStatus
	AutoBlockStatus: IAutoBlockStatus
}

interface IManualBlockStatus {
	IsBlocked: boolean
	RequestedTicks: number
}

interface IAutoBlockStatus {
	IsBlocked: boolean
}

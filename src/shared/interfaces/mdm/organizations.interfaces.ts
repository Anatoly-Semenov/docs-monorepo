import {
	CounteragentStatuses,
	NotReadyCounteragentStatuses
} from "@docs/shared/enums/mdm.enum"
import { OrganizationType } from "@docs/shared/enums/organization.enum"

export interface IMdmOrganization {
	accounts: IMdmOrganizationAccount[]
	isSeparateDivision: boolean
	guidMdmBusinessArea: string
	modificationDateUTC: string
	type: OrganizationType
	stateRegistration: string
	guidCounterparty: string
	modificationDate: string
	legalAddressGAR: string
	legalAddress: string
	charterName: string
	guidMainOrg: string
	factAddress: string
	mailAddress: string
	guidRegion: string
	isCancel: boolean
	fullName: string
	phones: string[]
	mails: string[]
	orgnip: string
	guid: string
	code: string
	name: string
	okpp: string
	inn: string
	kpp: string
}

export interface IMdmOrganizationAccount {
	modificationDateUTC: string
	modificationDate: string
	openingDate: string
	closingDate: string
	accNumber: string
	isCancel: boolean
	bankCode: string
	currency: string
	curCode: string
	using: string
	guid: string
	code: string
	name: string
	bank: string
	type: string
}

export interface IMdmOrganizationsStoreData {
	type: OrganizationType | ""
	full_name: string
	org_id: string
	name: string
	inn: string
	kpp: string
	id: string
}

export interface IDidadocOrganization {
	CounteragentStatus:
		| NotReadyCounteragentStatuses
		| CounteragentStatuses
		| string
	HasCertificateToSign: boolean
	JoinedDiadocTreaty: boolean
	FnsParticipantId: string
	InvitationCount: number
	Boxes: IDiadocBox[]
	Departments: object
	IsEmployee: boolean
	SearchCount: number
	Sociability: string
	IsRoaming: boolean
	IsForeign: boolean
	OrgIdGuid: string
	ShortName: string
	IsActive: boolean
	IsBranch: boolean
	FullName: string
	IfnsCode: string
	IsPilot: boolean
	Address: object
	IsTest: boolean
	OrgId: string
	Orrn: string
	Inn: string
	Kpp: string

	[k: string]: any
}

export interface IDiadocOrganizationWrappedContainer {
	Organizations: IDidadocOrganizationWrapper[]
}

export interface IDiadocOrganizationContainer {
	Organizations: IDidadocOrganization[]
}

export interface IDidadocOrganizationWrapper {
	CounteragentStatus: NotReadyCounteragentStatuses | string
	Organization: IDidadocOrganization
	LastEventTimestampTicks: number
	CounteragentGroupId: string
}

interface IDiadocBox {
	[k: string]: any
	BoxId: string
}

export interface IMdmResponse<T> {
	paging: IMdmResponsePaging
	success: boolean
	code: number
	data: T[]
}

export interface IMdmResponsePaging {
	amount: number
	pages: number
	total: number
	page: number
}

export type IMdmOrganizationResponse = IMdmResponse<IMdmOrganization>

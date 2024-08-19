import { IMdmResponse } from "@docs/shared/interfaces/mdm/organizations.interfaces"

export interface IMdmPartner {
	intraGroupOrganization: boolean
	accounts: IMdmPartnerAccount[]
	persons: IMdmPartnerPerson[]
	modificationDateUTC: string
	modificationDate: string
	legalAddressGAR: string
	legalAddress: string
	factAddress: string
	mailAddress: string
	isCancel: boolean
	fullName: string
	phones: string[]
	mails: string[]
	orgnip: string
	guid: string
	code: string
	name: string
	type: string
	okpp: string
	inn: string
	kpp: string
	fax: string
}

export interface IMdmPartnerAccount {
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

export interface IMdmPartnerPerson {
	modificationDateUTC: string
	modificationDate: string
	personGuid: string
	isCancel: boolean
	jobTitle: string
	phones: string[]
	mails: string[]
	fio: string
}

export type IMdmPartnerResponse = IMdmResponse<IMdmPartner>

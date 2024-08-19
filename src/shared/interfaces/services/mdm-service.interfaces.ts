import { ICounterpartyData } from "./docs-service.interfaces"

import { Organizations } from "@docs/common/db/entities/organizations.entity"

import {
	IDidadocOrganization,
	IMdmOrganization
} from "../mdm/organizations.interfaces"

export interface IMdmService {
	loadOrganizations: (startPage: number) => Promise<string>
	getBoxIdOrganization(id: string): Promise<IBoxIdResult>
	getBoxIdOuterSystem(
		inn: string,
		orgIdDiadoc: string,
		isRoaming: boolean
	): Promise<any>
	checkBoxesCounterparty(
		counterparty: ICounterpartyData,
		orgIdDiadoc: string
	): Promise<void>
	checkUl(entity: Organizations): boolean
	checkByInn(inn: string, entity: Organizations): Promise<IBoxIdResult>
	checkByInnKpp(
		inn: string,
		kpp: string,
		entity: Organizations
	): Promise<IBoxIdResult>
	resultProcessing(
		organizations: IDidadocOrganization[],
		entity: Organizations
	): Promise<IBoxIdResult>
	updateBoxIdAndOrgId(
		entity: Organizations,
		newBoxId: string,
		newBoxIdGuid: string,
		newOrgIdDiadoc: string
	): Promise<void>
	updateOrganization(dto: IMdmOrganization[]): Promise<Organizations[]>
	getOrganizationAccount(
		organizations: IDidadocOrganization[]
	): IDidadocOrganization
}

export interface IBoxIdResult {
	boxId: string
	boxIdGuid: string
	orgIdDiadoc: string
}

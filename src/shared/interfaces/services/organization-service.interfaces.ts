import { Organizations } from "@docs/common/db/entities/organizations.entity"

import { OrganizationsDto } from "@docs/shared/dto/v1/db-dto/organizations.dto"

export interface IOrganizationServiceDb {
	create(organizationDto: OrganizationsDto): Promise<Organizations>
	bulkCreate(
		organizationsDtoArray: OrganizationsDto[]
	): Promise<Organizations[]>
	update(id: string, organizationsDto: OrganizationsDto): Promise<Organizations>
	setBoxIdAndOrgId(
		entity: Organizations,
		newBoxId: string,
		newBoxIdGuid: string,
		newOrgIdDiadoc: string
	): Promise<Organizations>
	getById(id: string): Promise<Organizations>
	getByInn(inn: string): Promise<Organizations>
	getByKpp(kpp: string): Promise<Organizations>
	delete(id: string): Promise<Organizations>
	getDocFlowOrganizations(): Promise<Organizations[]>
	setDocFlow(orgId: string, docFlowStatus: boolean): Promise<Organizations>
	getByOrgId(orgId: string): Promise<Organizations>
}

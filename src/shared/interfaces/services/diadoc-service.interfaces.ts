import {
	LoadMode,
	OrganizationFeature
} from "@docs/shared/enums/organization.enum"

export interface IDiadocService {
	updateOrganizationFeatures(
		organizationId: string
	): Promise<OrganizationFeature[]>
	loadOrganizationFeatures(mode: LoadMode, pagesize: number): Promise<string>
	loadOrganizationFeaturesPaginated(mode: LoadMode): Promise<string>
}

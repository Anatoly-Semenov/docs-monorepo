import { CreateCounterpartyFromMdmDto } from "@docs/shared/dto/v1/db-dto/counterparty/create-counterparty-from-mdm.dto"

import {
	IMdmOrganization,
	IMdmOrganizationsStoreData
} from "../interfaces/mdm/organizations.interfaces"
import { ICounterparty } from "@docs/shared/interfaces/mdm/counterparty.interface"
import { IMdmPartner } from "@docs/shared/interfaces/mdm/partners.interfaces"

export const MdmOrganizationMapper = (
	organizations: IMdmOrganization[]
): IMdmOrganizationsStoreData[] => {
	return organizations
		.filter(
			(organization: IMdmOrganization) =>
				!organization.isCancel && organization.inn
		)
		.map((organization: IMdmOrganization): IMdmOrganizationsStoreData => {
			return {
				full_name: organization?.fullName || "",
				org_id: organization?.guid || "",
				name: organization?.name || "",
				type: organization?.type || "",
				inn: organization?.inn || "",
				kpp: organization?.kpp || "",
				id: organization?.guid || ""
			}
		})
}

export const MdmPartnersMapper = (partners: IMdmPartner[]): ICounterparty[] => {
	return partners
		.filter((partners: IMdmPartner) => !partners.isCancel && partners.inn)
		.map((partner: IMdmPartner): ICounterparty => {
			return new CreateCounterpartyFromMdmDto({
				is_cancel: partner.isCancel || false,
				full_name: partner.fullName || "",
				name: partner.name || "",
				// @ts-ignore
				type: partner.type || "",
				inn: partner.inn || "",
				kpp: partner.kpp || "",
				id: partner.guid || ""
			})
		})
}

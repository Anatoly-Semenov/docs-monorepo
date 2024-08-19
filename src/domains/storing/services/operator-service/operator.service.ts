import { Inject, Injectable, Logger } from "@nestjs/common"

import { DiadocClientService } from "@docs/common/clients/providers/diadoc/diadoc-client.service"

import { OperatorServiceDb } from "@docs/common/db/services/operators-service/operators.service"
import { OrganizationServiceDb } from "@docs/common/db/services/organizations/organization.service"
import { CounterpartyServiceDb } from "@docs/common/db/services/сounterparty-service/counterparty.service"
import { IOperatorDataExpand } from "@docs/shared/interfaces/services/db/operators-service.interfaces"
import {
	IOperatorForConnect,
	IOperatorForConnectWrapper,
	IOperatorService
} from "@docs/shared/interfaces/services/operator-service.interfaces"

import {
	IOC__SERVICE__CLIENT_PROVIDER_DIADOC,
	IOC__SERVICE__COUNTERPARTY_DB,
	IOC__SERVICE__ORGANIZATION_DB,
	IOC__SERVICE__ROAMING_OPERATORS_DB
} from "@docs/shared/constants/ioc.constants"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"
import { Organizations } from "@docs/common/db/entities/organizations.entity"

import {
	IDiadocOrganizationContainer,
	IDidadocOrganization
} from "@docs/shared/interfaces/mdm/organizations.interfaces"

import { CounteragentStatuses } from "@docs/shared/enums/mdm.enum"

@Injectable()
export class OperatorService implements IOperatorService {
	constructor(
		@Inject(IOC__SERVICE__ROAMING_OPERATORS_DB)
		private readonly operatorServiceDb: OperatorServiceDb,

		@Inject(IOC__SERVICE__CLIENT_PROVIDER_DIADOC)
		private readonly diadocClientService: DiadocClientService,

		@Inject(IOC__SERVICE__ORGANIZATION_DB)
		private readonly organizationServiceDb: OrganizationServiceDb,

		@Inject(IOC__SERVICE__COUNTERPARTY_DB)
		private readonly counterpartyServiceDb: CounterpartyServiceDb
	) {}

	private logger: Logger = new Logger(OperatorService.name)

	/**
	 * Загрузка роуминговых аккаунтов из Диадок
	 * @returns Promise<string>
	 */
	public async loadRoamingOperators(): Promise<string> {
		this.logger.log("Подгружаю справочник роуминговых контрагентов")
		const operators: IOperatorDataExpand[] =
			await this.diadocClientService.getRoamingOperators()

		await this.operatorServiceDb.saveList(operators)

		return "Справочник роуминговых аккаунтов успешно загружен"
	}

	/**
	 * Получение активных роуминговых операторов для организации
	 * @param organizationId ID организации
	 * @param counterpartyIds массив ID контрагентов
	 * @returns Promise<IOperatorForConnectWrapper>
	 */
	async getActiveOperators(
		organizationId: string,
		counterpartyIds: string[]
	): Promise<IOperatorForConnectWrapper> {
		this.logger.log(
			`Запущено получение действующих операторов для организации ${organizationId}`
		)

		const organizationInstance: Organizations =
			await this.organizationServiceDb.getById(organizationId)

		const counterpartyInstances: Counterparty[] =
			await this.counterpartyServiceDb.getById(counterpartyIds)

		const organizations: IDiadocOrganizationContainer =
			await this.diadocClientService.getOrganizationBoxIdByInnList(
				counterpartyInstances.map((counterparty) => counterparty.inn),
				organizationInstance.org_id_diadoc
			)

		const connectedOrganizations: IDidadocOrganization[] =
			organizations.Organizations.filter((organization) => {
				return (
					organization.CounteragentStatus ===
					CounteragentStatuses.IsMyCounteragent
				)
			})

		const selectedOperators: IOperatorForConnect[] = []

		await Promise.all(
			connectedOrganizations.map(async (connectedOrganization) => {
				const inn: string = connectedOrganization?.Organization?.Inn ?? ""
				const counterpartyInstance: Counterparty = (
					await this.counterpartyServiceDb.getByInn([inn])
				)?.[0]

				const counterpartyId: string = counterpartyInstance?.id ?? ""
				const counterpartyShortName: string = counterpartyInstance?.name ?? ""
				const boxId: string =
					connectedOrganization?.Organization?.Boxes?.[0]?.BoxId ?? ""

				const shortFnsId =
					connectedOrganization?.Organization?.FnsParticipantId?.slice(
						0,
						3
					).toLocaleLowerCase() ?? ""

				const operatorName: string =
					(await this.operatorServiceDb.getByFnsShortId(shortFnsId))?.name ??
					"Диадок"

				selectedOperators.push({
					box_id: boxId,
					counterparty: counterpartyShortName,
					counterparty_id: counterpartyId,
					operator: operatorName
				})
			})
		)

		return {
			counterparties: selectedOperators
		}
	}
}

import {
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import {
	IOperatorDataExpand,
	IOperatorDb,
	IOperatorServiceDb
} from "@docs/shared/interfaces/services/db/operators-service.interfaces"

import { Operator } from "../../entities/operators.entity"

@Injectable()
export class OperatorServiceDb implements IOperatorServiceDb {
	private readonly logger = new Logger(OperatorServiceDb.name)

	constructor(
		@InjectRepository(Operator)
		private readonly operatorsRepository: Repository<Operator>
	) {}

	private setError(message: string): void {
		this.logger.error(message)
		throw new InternalServerErrorException(message)
	}

	public async saveList(operators: IOperatorDataExpand[]): Promise<Operator[]> {
		this.logger.log(
			`Пакетное сохранение роуминговых операторов (${operators.length}шт)`
		)

		const mappedOperators: IOperatorDb[] = operators.map((operator) => {
			return {
				fns_id: operator.FnsId.toLowerCase(),
				name: operator.Name,
				is_active: operator.IsActive
			}
		})

		try {
			return (
				await this.operatorsRepository.upsert(mappedOperators, ["fns_id"])
			).raw
		} catch (e) {
			this.setError(
				`Ошибка пакетного сохранения роуминговых операторов: ${e.message}`
			)
		}
	}

	public async getByFnsShortId(fnsId: string): Promise<Operator> {
		this.logger.log(`Ищу оператора по ФНС_ID ${fnsId}`)
		try {
			return this.operatorsRepository.findOneBy({
				fns_id: fnsId,
				is_active: true
			})
		} catch (e) {
			this.setError(
				`Возникла ошибка при получении оператора по ФНС_ID ${fnsId}: ${e.message}`
			)
		}
	}
}

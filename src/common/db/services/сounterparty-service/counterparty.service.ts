import { isArray } from "lodash"

import {
	Injectable,
	InternalServerErrorException,
	Logger
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"

import { In, Repository } from "typeorm"

import { ICounterpartyServiceDb } from "@docs/shared/interfaces/services/db/counterparty-service.interfaces"

import { Counterparty } from "@docs/common/db/entities/counterparty.entity"

import { ICounterparty } from "@docs/shared/interfaces/mdm/counterparty.interface"

@Injectable()
export class CounterpartyServiceDb implements ICounterpartyServiceDb {
	private readonly logger = new Logger(CounterpartyServiceDb.name)

	constructor(
		@InjectRepository(Counterparty)
		private readonly counterpartyRepository: Repository<Counterparty>
	) {}

	private setError(message: string): void {
		this.logger.error(message)
		throw new InternalServerErrorException(message)
	}

	public async getAll(): Promise<Counterparty[]> {
		try {
			return await this.counterpartyRepository.find()
		} catch (error) {
			this.setError("Ошибка запроса справочника контрагентов")
		}
	}

	public async saveList(
		counterparties: ICounterparty[]
	): Promise<Counterparty[]> {
		this.logger.log(
			`Пакетное сохранение контрагентов (${counterparties.length}шт)`
		)

		try {
			return await this.counterpartyRepository.save(counterparties)
		} catch (error) {
			this.setError("Не получилось сохранить список контрагентов")
		}
	}

	/**
	 * Получение контрагентов по ИНН[]
	 * @param inn массив ИНН
	 * @returns инстансы контрагентов
	 */
	public async getByInn(inn: string[]): Promise<Counterparty[]> {
		this.logger.log(
			`Получение контрагентов из бд по ИНН: ${JSON.stringify(inn)}`
		)
		try {
			return await this.counterpartyRepository.findBy({
				inn: In(inn)
			})
		} catch (e) {
			this.setError(
				`Ошибка считывания контрагентов из БД по ИНН: ${JSON.stringify(inn)}: ${e.message}`
			)
		}
	}

	/**
	 * Получение контрагентов по ID[]
	 * @param id массив ID контрагентов
	 * @returns инстансы контрагента
	 */
	public async getById(id: string[]): Promise<Counterparty[]> {
		this.logger.log(`Получение контрагентов из бд по ID: ${JSON.stringify(id)}`)
		try {
			return this.counterpartyRepository.findBy({
				id: In(id)
			})
		} catch (e) {
			this.setError(
				`Ошибка считывания контрагентов из БД по ID: ${JSON.stringify(id)}: ${e.message}`
			)
		}
	}

	async count(): Promise<number> {
		this.logger.log(`Считаю количество контрагентов в БД`)

		try {
			const result: number = await this.counterpartyRepository.count()

			this.logger.log(`Количество контрагентов в БД: ${result}`)

			return result
		} catch (error) {
			this.setError(`Ошибка счета количества контрагентов в БД`)
		}
	}
}

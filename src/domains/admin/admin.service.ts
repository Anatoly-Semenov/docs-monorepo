import * as bcrypt from "bcrypt"

import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { SystemsServiceDb } from "@docs/common/db/services/systems-service/systems.service"

import { IOC__SERVICE__SYSTEMS_DB } from "@docs/shared/constants/ioc.constants"

import { Admin } from "@docs/common/db/entities/admin.entity"
import { Systems } from "@docs/common/db/entities/systems.entity"

import { AdminRegistrationDto } from "./dto/admin-registration.dto"
import { AdminResponseDto } from "./dto/admin-response.dto"

import { AdminRule } from "../admin.enum"

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(Admin)
		private readonly adminRepository: Repository<Admin>,

		// (!) Optional for admin.validator.ts
		@Inject(IOC__SERVICE__SYSTEMS_DB)
		private readonly systemService?: SystemsServiceDb,
		private readonly configService?: ConfigService,
		private readonly jwtService?: JwtService
	) {}

	async registration(user: AdminRegistrationDto): Promise<AdminResponseDto> {
		// Checks by candidates
		await Promise.all([
			this.checkAdminCandidateByUsername(user.username),
			this.checkSystemCandidate(user.system_id)
		])

		const bcryptPassword = await bcrypt.hash(user.password, 10)

		try {
			const newUser: Admin = await this.adminRepository.create({
				system: { id: user.system_id },
				rights: AdminRule.CAN_READ,
				password: bcryptPassword,
				username: user.username
			})

			await this.adminRepository.save(newUser)

			return new AdminResponseDto({
				...this.generateTokens(newUser.id),
				message: `Пользователь ${user.username} успешно создан`
			})
		} catch (error) {
			throw new BadRequestException("Ошибка создания админского пользователя")
		}
	}

	async loginFromValidator(username: string, password: string): Promise<Admin> {
		const errorText: string = "Неверный логин или пароль"

		let candidate: Admin | null

		try {
			candidate = await this.adminRepository.findOne({
				where: {
					username
				}
			})
		} catch (error) {
			throw new BadRequestException("Ошибка авторизации")
		}

		if (!candidate) {
			throw new BadRequestException(errorText)
		}

		const isCorrectPassword: boolean = await bcrypt.compare(
			password,
			candidate.password
		)

		if (!isCorrectPassword) {
			throw new BadRequestException(errorText)
		}

		return candidate
	}

	async login(username: string, password: string): Promise<AdminResponseDto> {
		try {
			const candidate: Admin = await this.loginFromValidator(username, password)

			return this.generateTokens(candidate.id)
		} catch (error) {
			throw new BadRequestException(error)
		}
	}

	private async checkAdminCandidateByUsername(username: string): Promise<void> {
		let candidate: Admin | null

		try {
			candidate = await this.adminRepository.findOne({
				where: {
					username: username
				}
			})
		} catch (e) {
			throw new BadRequestException(
				`Ошибка проверки кандидата на регистрацию username=${username}`
			)
		}

		if (candidate) {
			throw new BadRequestException(
				`Пользователь с username=${username} уже существует в системе`
			)
		}
	}

	private async checkSystemCandidate(systemId: string): Promise<void> {
		try {
			const systemCandidate: Systems =
				await this.systemService.getById(systemId)

			if (!systemCandidate) {
				throw new ForbiddenException(
					`system_id=${systemId} не существует в системе`
				)
			}
		} catch (error) {
			throw new BadRequestException(
				`Ошибка поиска системы systemId=${systemId}`
			)
		}
	}

	private generateTokens(id: string): AdminResponseDto {
		if (!id) {
			throw new BadRequestException("Ошибка генерации авторизации")
		}

		const secretJwt: string = this.configService.getOrThrow("JWT_ACCESS_SECRET")
		const secretJwtRefresh: string =
			this.configService.getOrThrow("JWT_REFRESH_SECRET")

		return new AdminResponseDto({
			access_token: this.jwtService.sign(
				{
					id
				},
				{
					secret: secretJwt
				}
			),

			refresh_token: this.jwtService.sign(
				{
					id
				},
				{
					secret: secretJwtRefresh
				}
			)
		})
	}
}

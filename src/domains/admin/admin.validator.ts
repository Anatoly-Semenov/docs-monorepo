import { getRepositoryToken } from "@nestjs/typeorm"

import { Repository } from "typeorm"

import { AdminService } from "./admin.service"

import { Admin } from "@docs/common/db/entities/admin.entity"

export const adminCredentialValidator = {
	inject: [getRepositoryToken(Admin)],
	useFactory: (adminRepository: Repository<Admin>) => {
		return async function validateCredentials(
			username: string,
			password: string
		) {
			const adminService = new AdminService(adminRepository)

			return await adminService.loginFromValidator(username, password)
		}
	}
}

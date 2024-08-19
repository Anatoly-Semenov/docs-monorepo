import { ForbiddenException } from "@nestjs/common"

import { AdminRule } from "../../admin.enum"

export const AdminRights = (rights: AdminRule[]): MethodDecorator => {
	return (_, __, propertyDescriptor: PropertyDescriptor) => {
		const originalMethod = propertyDescriptor.value

		propertyDescriptor.value = async function (...args: any[]) {
			const userRights: AdminRule[] | undefined =
				args?.[0]?.user?.rights?.split(",")

			if (!userRights) {
				throw new ForbiddenException(
					"У вашего пользователя отсутствуют права, обратитесь к администратору"
				)
			}

			for (const right of rights) {
				if (!userRights.includes(right)) {
					throw new ForbiddenException("У вас нет прав на данную операцию")
				}
			}

			return await originalMethod.apply(this, args)
		}
	}
}

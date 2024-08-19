import { DefaultAdminController } from "nestjs-admin"

import { Get, Param, Req } from "@nestjs/common"

import express from "express"

import { AdminRights } from "../decorators/admin-rights.decorator"

import { AdminModel, AdminModelsQuery } from "../admin.interfaces"

import { AdminRule } from "../../admin.enum"

import { EntityType } from "nestjs-admin/dist/src/types"

// @ts-ignore
export class AdminController extends DefaultAdminController {
	// @override
	@Get("/:sectionName/:entityName/:primaryKey/change")
	@AdminRights([AdminRule.CAN_EDIT])
	// @ts-ignore
	async change(
		@Req() request: express.Request,
		@Param() params: AdminModelsQuery
	): Promise<unknown> {
		const { section, adminEntity, metadata, entity } =
			await this.getAdminModels(params)

		// @ts-ignore
		return this.env.render("change.njk", {
			request,
			section,
			adminEntity,
			metadata,
			entity
		})
	}

	@AdminRights([AdminRule.CAN_DELETE])
	async delete(
		request: express.Request,
		params: AdminModelsQuery,
		response: express.Response
	): Promise<void> {
		return super.delete(request, params, response)
	}

	@AdminRights([AdminRule.CAN_CREATE])
	create(
		request: express.Request,
		createEntityDto: object,
		params: AdminModelsQuery,
		response: express.Response
	): Promise<void> {
		return super.create(request, createEntityDto, params, response)
	}

	// @ts-ignore // @override
	private getAdminModels(query: AdminModelsQuery): Promise<AdminModel> {
		return new Promise(async (resolve, reject) => {
			const result: Partial<AdminModel> = {
				adminEntity: null,
				metadata: null,
				section: null,
				entity: null
			}

			if (query.sectionName) {
				// @ts-ignore
				const section = await this.adminSite.getSection(query.sectionName)

				const entity: EntityType = section.entities[query.entityName]

				// @ts-ignore
				result.metadata = entity.metadata
				result.adminEntity = entity
				result.section = section
				result.entity = entity

				resolve(result as AdminModel)
			} else {
				reject(new Error("Failed to get admin model"))
			}
		})
	}
}

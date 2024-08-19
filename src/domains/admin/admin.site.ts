import { DefaultAdminSite } from "nestjs-admin"

import { Injectable } from "@nestjs/common"

@Injectable()
export class AdminSite extends DefaultAdminSite {
	// Todo: пригодиться в будущем для кастомизации админки
}

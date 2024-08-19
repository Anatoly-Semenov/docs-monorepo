import { IFileCleanerService } from "@docs/shared/interfaces/services/db/files-service.interfaces"

export interface ICronSigningService {
	handleStatusRefreshing(): Promise<void>
	refreshLists(): Promise<void>
}

export interface ICronStoringService extends IFileCleanerService {}

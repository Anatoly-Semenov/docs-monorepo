interface IDb {
	create()
	read()
	update()
	delete()
}

class SingletonConnectToDb {
	private _instance?: IDb = null

	public async instance(): Promise<IDb> {
		if (!this._instance) {
			this._instance = await this.connectToDb()
		}

		return this._instance!
	}

	private async connectToDb(): Promise<IDb> {
		return {
			create() {},
			read() {},
			update() {},
			delete() {}
		} as IDb
	}
}

const db = async () => {
	return await new SingletonConnectToDb().instance()
}

// @ts-ignore
db.create()

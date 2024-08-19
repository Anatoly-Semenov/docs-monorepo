interface IComputerBuilder {
	addCpu(cpu: string): IComputerBuilder
	addGpu(gpu: number): IComputerBuilder
	addRam(cpu: number): IComputerBuilder
	addSsd(cpu: number): IComputerBuilder
}

class Computer implements IComputerBuilder {
	private cpu: string
	private gpu: number
	private ram: number
	private ssd: number

	public addCpu(cpu: string): this {
		this.cpu = cpu

		return this
	}

	public addGpu(gpu: number): this {
		this.gpu += gpu

		return this
	}

	public addRam(ram: number): this {
		this.ram += ram

		return this
	}

	public addSsd(ssd: number): this {
		this.ssd += ssd

		return this
	}
}

const computer: Computer = new Computer()
	.addCpu("Intel core i9")
	.addGpu(8)
	.addRam(64)
	.addSsd(3000)

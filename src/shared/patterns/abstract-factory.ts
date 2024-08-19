interface IWidgetFactory {
	createScrollBar(): void
	createWindow(): void
}

class Widget implements IWidgetFactory {
	public createScrollBar(): void {
		//
	}

	public createWindow(): void {
		//
	}
}

const widget = new Widget()

widget.createWindow()
widget.createScrollBar()

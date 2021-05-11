const COLORS = [
	"black",
	"blue",
	"gold",
	"grey",
	"orange",
	"red",
	"violet",
	"yellow",
];

export class ColorsManager {
	private colors: string[];

	constructor() {
		this.colors = [...COLORS];
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift() || "";
	}

	addColor(color: string) {
		this.colors.push(color);
	}
}

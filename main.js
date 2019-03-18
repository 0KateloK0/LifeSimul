const START_HEALTH = 100;
const DNA_LENGTH  = 64;
const fw          = 250;
const fh          = 250;

var field = [];
for (var i = 0; i < fh; i++){
	field[i] = [];
	for (var j = 0; j < fw; j++)
		field[i][j] = 0;
}

/**
 * Creates Cell constructor
 * @param  {} obj it contains: start_pos, start_health
 * @return {cell}
 */
function Cell(settings) {
	this.x = settings.start_pos.x || 0;
	this.y = settings.start_pos.y || 0;

	this.health = settings.start_health || START_HEALTH;

	this.DNA = [];
	for (var i = 0; i < DNA_LENGTH; i++)
		this.DNA[i] = Math.floor( Math.random() * DNA_LENGTH );

	this.DNA_pos = 0;

	/**
	 * this fnc calls every frame. It determines cell behavior by its DNA
	 * @return {cell}
	 */
	this.lifeCicle = function() {
		var LCIt = 0;
		while (LCIt < 8) {
			var DNA_now = this.DNA[this.DNA_pos];

			if (DNA_now < 8) {
				this.move(DNA_now);
				this.DNA_pos += DNA_now % DNA_LENGTH;
			}

			LCIt++;
		}

		return this;
	}

	this.move = function(dir) {
		var dx = 0,
			dy = 0;

		switch (dir) {
			case 0:
				dx--;
			case 1: 
				dy++;
				break;
			case 2: 
				dy++;
			case 3:
				dx++;
				break;
			case 4:
				dx++;
			case 5:
				dy--;
				break;
			case 6:
				dy--;
			case 7:
				dx--;
				break;
		}

		var tx = (this.x + dx) % fw,
			ty = (this.y + dy) % fh;

		if (field[ty][tx] == 0) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			field[ty][tx] = this;
		}

		return this;
	}

	this.valueOf = function () { return 1 }
	this.toString = function () {
		return 'x: ' + this.x + ', y: ' + this.y + ', health: ' + this.health;
	}

	return this;
}
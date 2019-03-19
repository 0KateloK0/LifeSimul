const START_HEALTH  = 100;
const DNA_LENGTH    = 64;
const HEAL_PER_ORG  = 25;
const HEAL_PER_MIN  = 30;
const pixel         = 5;
const fw            = cvs.width / pixel;
const fh            = cvs.height / pixel;

function init() {
	field = [];
	cells = [];
	for (var i = 0; i < fh; i++){
		field[i] = [];
		for (var j = 0; j < fw; j++){
			k = Math.random();
			if (k < 0.5)
				field[i][j] = 0;
			else if (k < 0.75)
				field[i][j] = 3;
			else {
				cells.push(new Cell({
					start_pos: {x: i, y: j},
				}));
				field[i][j] = cells[cells.length - 1];
			}
		}
	}

	draw();
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

	this.color = 'green';

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
				this.DNA_pos = (this.DNA_pos + DNA_now % 8) % DNA_LENGTH;
			} else if (DNA_now < 16) {
				this.eat(DNA_now);
				this.DNA_pos = (this.DNA_pos + DNA_now % 8) % DNA_LENGTH;
			} else
				this.DNA_pos = (this.DNA_pos + DNA_now) % DNA_LENGTH;

			LCIt++;
		}

		return this;
	}

	this.move = function(dir) {
		var DCoord = DxDyByDir(dir);
		var dx = DCoord.x;
		var dy = DCoord.y;

		var tx = (this.x + dx + fw) % fw,
			ty = (this.y + dy + fh) % fh;

		if (field[ty][tx] == 0) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			field[ty][tx] = this;
		}

		return this;
	}

	this.eat = function (dir) {
		var DCoord = DxDyByDir(dir);
		var dx = DCoord.x,
			dy = DCoord.y;

		var tx = (this.x + dx) % fw,
			ty = (this.y + dy) % fh;

		if (field[ty][tx] == 0) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			field[this.y][this.x] = this;
		} else if (field[ty][tx] == 1) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += Math.floor(field[ty][tx].health / 4);
			field[this.y][this.x] = this;
		} else if (field[ty][tx] == 2) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += HEAL_PER_ORG;
			field[this.y][this.x] = this;
		} else if (field[ty][tx] == 3) {
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += HEAL_PER_MIN;
			field[this.y][this.x] = this;
		}
	}

	function DxDyByDir (dir) {
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

		return {x: dx, y: dy}
	}

	this.valueOf = function () { return 1 }
	this.toString = function () {
		return 'x: ' + this.x + ', y: ' + this.y + ', health: ' + this.health;
	}

	return this;
}

function draw() {
	if (cells.length > 0)
		requestAnimationFrame(draw);

	ctx.clearRect(0, 0, cvs.width, cvs.height);
	for (var i = 0; i < fh; i++)
		for (var j = 0; j < fw; j++) {
			if (field[i][j] == 0)
				ctx.fillStyle = 'white';
			else if (field[i][j] == 1)
				ctx.fillStyle = field[i][j].color;
			else if (field[i][j] == 2)
				ctx.fillStyle = 'grey';
			else if (field[i][j] == 3)
				ctx.fillStyle = 'blue';
			ctx.fillRect(i * pixel, j * pixel, pixel, pixel);
		}

	cells.forEach(function (a) { a.lifeCicle() });
}
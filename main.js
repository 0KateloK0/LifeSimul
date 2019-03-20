const START_HEALTH              = 100;
const DNA_LENGTH                = 64;
const HEAL_PER_ORG              = 40;
const HEAL_PER_MIN              = 50;
const HEALTH_REDUCING_PER_CICLE = 1;
const HEALTH_NEEDED_TO_MULTIP   = 130;
const MAX_SEED_ALIFETIME        = 5;
const PLANTS_DNA_LENGTH         = 32;

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
			else if (k < 0.9) {
				cells.push(new Animal({
					start_pos: {x: j, y: i}
				}));
				field[i][j] = cells[cells.length - 1];
			} else {
				cells.push(new Plant({
					start_pos: {x: j, y: i}
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
function Animal(settings) {
	this.x = settings.start_pos.x || 0;
	this.y = settings.start_pos.y || 0;

	this.health = settings.start_health || START_HEALTH;
	this.alifeQ = true;

	this.color = 'brown';

	if (!!settings.start_DNA) {
		this.DNA = settings.start_DNA;
		if (settings.mutantQ) {
			k = Math.floor( Math.random() * DNA_LENGTH );
			this.DNA[k] = Math.floor( Math.random() * DNA_LENGTH );
		}
	} else {
		this.DNA = [];
		for (var i = 0; i < DNA_LENGTH; i++)
			this.DNA[i] = Math.floor( Math.random() * DNA_LENGTH );
	}


	this.DNA_pos = 0;

	/**
	 * this fnc calls every frame. It determines cell behavior by its DNA
	 * @return {cell}
	 */
	this.lifeCicle = function() {
		var LCIt = 0;
		while (LCIt < 8 && this.alifeQ) {
			var DNA_now = this.DNA[this.DNA_pos];

			if (DNA_now < 8) {
				this.move(DNA_now % 8);
				this.DNA_pos = (this.DNA_pos + DNA_now % 8) % DNA_LENGTH;
			} else if (DNA_now < 16) {
				this.eat(DNA_now % 8);
				this.DNA_pos = (this.DNA_pos + DNA_now % 8) % DNA_LENGTH;
			} else
				this.DNA_pos = (this.DNA_pos + DNA_now) % DNA_LENGTH;

			this.health -= HEALTH_REDUCING_PER_CICLE;
			if (this.health < 0) {
				field[this.y][this.x] = 2;
				this.alifeQ = false;
			}

			if (this.health > HEALTH_NEEDED_TO_MULTIP)
				this.multiplate();

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

		var tx = (this.x + dx + fw) % fw,
			ty = (this.y + dy + fh) % fh;

		if (field[ty][tx] == 1) {
			field[ty][tx].alifeQ = false;
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += Math.floor(field[ty][tx].health / 1.68);
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
		} else if (field[ty][tx] == 4) {
			field[ty][tx].alifeQ = false;
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += Math.floor(field[ty][tx].health / 2);
			field[this.y][this.x] = this;
		} else if (field[ty][tx] == 5) {
			field[ty][tx].alifeQ = false;
			field[this.y][this.x] = 0;
			this.x = tx;
			this.y = ty;
			this.health += field[ty][tx].alifeTime * 10;
			field[this.y][this.x] = this;
		}
	}

	this.multiplate = function () {
		loop: for (var i = this.y - 1; i < this.y + 1; i++)
			for (var j = this.x - 1; j < this.x + 1; j++)
				if (i >= 0 && j >= 0) 
					if (field[i][j] == 0) {
						cells.push(new Animal({
							start_pos: {x: j, y: i},
							start_health: Math.round(this.health / 1.5),
							start_DNA: this.DNA,
							mutantQ: Math.random() < 0.25
						}));
						this.health = Math.round(this.health / 1.5);
						field[i][j] = cells[cells.length - 1];
						break loop;
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

function Plant (settings) {
	this.x = settings.start_pos.x;
	this.y = settings.start_pos.y;

	this.alifeQ = true;

	if (!!settings.start_DNA)
		this.DNA = settings.start_DNA;
	else {
		this.DNA = [];
		for (var i = 0; i < PLANTS_DNA_LENGTH; i++)
			this.DNA.push( Math.floor( Math.random() * PLANTS_DNA_LENGTH ) );
	}

	this.DNA_pos = 0;

	this.health = START_HEALTH;

	this.lifeCicle = function () {
		if (this.DNA[this.DNA_pos] < 8) {
			this.photosynthesis();
			this.DNA_pos = (this.DNA_pos + this.DNA[this.DNA_pos]) % PLANTS_DNA_LENGTH;
		} else if (this.DNA[this.DNA_pos] < 16){

		} else
			this.DNA_pos = (this.DNA_pos + this.DNA[this.DNA_pos] % 8) % PLANTS_DNA_LENGTH;

		this.health -= HEALTH_REDUCING_PER_CICLE;
		if (this.health < 0) {
			field[this.y][this.x] = 2;
			this.alifeQ = false;
		}

		if (this.health > HEALTH_NEEDED_TO_MULTIP)
			this.multiplate();
	}

	this.photosynthesis = function () {
		if (this.y < 20)
			this.health += 5;
		else if (this.y < 40)
			this.health += 4;
		else if (this.y < 60)
			this.health += 3;
		else if (this.y < 80)
			this.health += 2;
		else
			this.health += 1;
	}

	this.multiplate = function () {
		loop: for (var i = this.y - 1; i < this.y + 1; i++)
			for (var j = this.x - 1; j < this.x + 1; j++)
				if (i >= 0 && j >= 0) 
					if (field[i][j] == 0) {
						cells.push(new Seed({
							start_pos: {x: j, y: i},
							start_DNA: this.DNA,
							mutantQ: Math.random() < 0.25
						}));
						this.health = Math.round(this.health / 2);
						field[i][j] = cells[cells.length - 1];
						break loop;
					}
	}

	this.valueOf = function () { return 4 }
	this.toString = function () {
		return 'x: ' + this.x + ', y: ' + this.y + ', health: ' + this.health;
	}

	return this;
}

function Seed (settings) {
	this.alifeTime = 0;

	this.x = settings.start_pos.x;
	this.y = settings.start_pos.y;

	this.alifeQ = true;

	this.setup = settings;

	this.lifeCicle = function() {
		if (this.alifeTime > MAX_SEED_ALIFETIME) {
			cells.push(new Plant(this.setup));
			field[this.y][this.x] = cells[cells.length - 1];
			this.alifeQ = false;
		} else
			this.alifeTime++;
	}

	this.valueOf = function () { return 5 }
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
			else if (field[i][j] == 4)
				ctx.fillStyle = 'green';
			else if (field[i][j] == 5)
				ctx.fillStyle = 'orange';
			ctx.fillRect(i * pixel, j * pixel, pixel, pixel);
		}

	cells.forEach(function (a) { a.lifeCicle() });
	cells = cells.filter(function(a) {return a.alifeQ});

	for (var i = 0; i < fh; i++) 
		for (var j = 0; j < fw; j++) 
			if (field[i][j] != 1 && field[i][j] != 2 && field[i][j] != 3 &&
				field[i][j] != 4 && field[i][j] != 5 && Math.random() > 0.995)
				field[i][j] = 3;
}
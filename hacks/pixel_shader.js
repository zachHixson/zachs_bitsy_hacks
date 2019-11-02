/*
Pixel Shaders
- Adds pixel shader functionality to your bitsy project which can be called from the javascript from dialog hack, or from your own code

Programmer: Zach Hixson
Year: 2019
*/
let pixelShaderOn = true;
let curShader = null;
let time = 0;
let shaderParams = {};

class ShaderArgs {
	constructor(){
		this.pixel = {
			r : 0,
			g : 0,
			b : 0,
			a : 0
		}

		this.x = 0;
		this.y = 0;
		this.buffer;
		this.frameRandom = Math.random();
	}

	rgbaFromBufferIdx(buffIn, idx){
		this.pixel.r = buffIn.data[idx + 0];
		this.pixel.g = buffIn.data[idx + 1];
		this.pixel.b = buffIn.data[idx + 2];
		this.pixel.a = buffIn.data[idx + 3];
	}
}

class ShaderFunc{
	static getPixelIdx(width, x, y){
		return (y * width + x) * 4;
	}
	
	static mixVal(val1, val2, fac){
		fac /= 100;
		val1 *= fac;
		val2 *= 1 - fac;
		return val1 + val2;
	}

	static getDistance(x1, y1, x2, y2){
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}
}

function activateShader(shaderIn){
	curShader = shaderIn;
	pixelShaderOn = true;
}

function deactivateShader(){
	pixelShaderOn = false;
}

drawRoom = (function(){
	let old_func = drawRoom;

	return function(){
		let result;

		result = old_func.apply(this, [room[curRoom]]);

		if (pixelShaderOn){
			callPixelShader(canvas);
		}

		return result;
	}
}());

function callPixelShader(canvasIn){
	if (curShader != null){
		let ctx = canvasIn.getContext('2d');
		let curBuffer = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
		let newBuffer = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
		let shaderArgs = new ShaderArgs();

		for (let x = 0; x < canvas.width; x++){
			for (let y = 0; y < canvas.height; y++){
				let pIdx = ShaderFunc.getPixelIdx(canvasIn.width, x, y);

				shaderArgs.rgbaFromBufferIdx(curBuffer, pIdx);
				shaderArgs.buffer = curBuffer;
				shaderArgs.x = x;
				shaderArgs.y = y;

				curShader(shaderArgs, canvasIn);

				newBuffer.data[pIdx + 0] = shaderArgs.pixel.r;
				newBuffer.data[pIdx + 1] = shaderArgs.pixel.g;
				newBuffer.data[pIdx + 2] = shaderArgs.pixel.b;
				newBuffer.data[pIdx + 3] = shaderArgs.pixel.a;
			}
		}

		ctx.putImageData(newBuffer, 0, 0);
	}
	
	time++;
}
function warpShader(args, canvasIn){
	//setup parameters
	if (shaderParams && shaderParams.name != "warp"){
		delete shaderParams;
		shaderParams = {
			name : "warp",
			speedDiv : 30,
			waveLength : 20,
			amplitude : 5
		}
	}

	let sin = Math.sin((time / shaderParams.speedDiv) + (args.x / shaderParams.waveLength));
	let height = Math.floor((sin + 1) * shaderParams.amplitude);
	let pIdx = ShaderFunc.getPixelIdx(canvasIn.width, args.x, (args.y + height) % canvas.height);

	args.rgbaFromBufferIdx(args.buffer, pIdx);
}

function chromaShader(args, canvasIn){
	//setup parameters
	if (shaderParams && shaderParams.name != "chroma"){
		delete shaderParams;
		shaderParams = {
			name : "chroma",
			amplitude : 3,
			fuzz : true,
			mix : 50
		}
	}
	let randR = 0;
	let randG = 0;
	let randB = 0;

	if (shaderParams.fuzz){
		randR = Math.floor(Math.random() * shaderParams.amplitude);
		randG = Math.floor(Math.random() * shaderParams.amplitude);
		randB = Math.floor(Math.random() * shaderParams.amplitude);
	}

	let chromaR = args.buffer.data[ShaderFunc.getPixelIdx(canvasIn.width, args.x, args.y + shaderParams.amplitude + randR)];
	let chromaG = args.buffer.data[ShaderFunc.getPixelIdx(canvasIn.width, args.x + shaderParams.amplitude + randG, args.y)];
	let chromaB = args.buffer.data[ShaderFunc.getPixelIdx(canvasIn.width, args.x - shaderParams.amplitude + randB, args.y)];
	let r = ShaderFunc.mixVal(args.pixel.r, chromaR, shaderParams.mix);
	let g = ShaderFunc.mixVal(args.pixel.g, chromaG, shaderParams.mix);
	let b = ShaderFunc.mixVal(args.pixel.b, chromaB, shaderParams.mix);

	args.pixel.r = r;
	args.pixel.g = g;
	args.pixel.b = b;
}

function shakeShader(args, canvasIn){
	//setup parameters
	if (shaderParams && shaderParams.name != "shake"){
		delete shaderParams;
		shaderParams = {
			name : "shake",
			amplitude : 3,
			frequency : 1
		}
	}

	if (time % shaderParams.frequency == 0){
		let dir = [0, 0];
		let offset = Math.round((args.frameRandom * shaderParams.amplitude * 2) - (shaderParams.amplitude / 2));

		if (args.frameRandom * 3 > 1){
			dir[0] = offset;
		}
		else if (args.frameRandom * 3 > 2){
			dir[1] = offset;
		}
		else{
			dir[0] = offset;
			dir[1] = offset;
		}

		args.rgbaFromBufferIdx(args.buffer, ShaderFunc.getPixelIdx(canvasIn.width, (args.x + dir[0]) % canvasIn.width, (args.y + dir[1]) % canvasIn.height));
	}
}

function spotlightShader(args, canvasIn){
	//setup parameters
	if (shaderParams && shaderParams.name != "spotlight"){
		delete shaderParams;
		shaderParams = {
			name : "spotlight",
			x : canvas.width / 2,
			y : canvas.height / 2,
			radius : 100,
			opacity : 50,
			fuzz : true,
			fuzziness : 12,
			followPlayer : true
		}
	}

	let dist;

	if (shaderParams.followPlayer){
		dist  = ShaderFunc.getDistance(args.x, args.y, (player().x + 0.5) * 32, (player().y + 0.5) * 32) - shaderParams.radius;
	}
	else{
		dist = ShaderFunc.getDistance(args.x, args.y, shaderParams.x, shaderParams.y) - shaderParams.radius;
	}

	if (shaderParams.fuzz){
		dist += (Math.random() * shaderParams.fuzziness) - (shaderParams.fuzziness / 2);
	}

	let clamp = (dist > 1) ? 1 - (shaderParams.opacity / 100) : 1;

	args.pixel.r = args.pixel.r * clamp;
	args.pixel.g = args.pixel.g * clamp;
	args.pixel.b = args.pixel.b * clamp;
}
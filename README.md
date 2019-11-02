# Zach's Bitsy Hacks

### Overview
This repository contains two hacks: A system to run [Pixel Shaders](hacks/pixel_shader.js) which help you add cool visual effects, as well as a couple of [Javascript Helper Functions](hacks/helper_functions.js) that you can be called easily using [Sean's javascript from dialog hack](https://github.com/seleb/bitsy-hacks/blob/master/dist/javascript-dialog.js)

To install, simply copy and paste the hack between two `<script></script>` tags at the bottom of your downloaded **.html** file. 

---

## [Helper functions](hacks/helper_functions.js)
Using [Sean's javascript from dialog hack](https://github.com/seleb/bitsy-hacks/blob/master/dist/javascript-dialog.js) you can easily call one of these functions from dialog. For example if I wanted to remove an item from dialog I would type:
`Hello! Here is some dialog (js "removeItemFromRoom('myItem')")` which will remove the specified item from the room.

### List of Helper functions
All helper functions below are written in the format of `functionName(p1, p2, p3)`.

A `*` next to a parameter means it is optional, and can be left blank, so `f(p1, *p2)` could also be written as `f(p1)`.

If a parameter is in single quotes `''` you must include the quotes around the parameter.

- `spawmItem('itemName', x_position, y_position, *'roomName')`: Spawns an item at the designated position. If the roomName is specified, it will spawn that item in the designated room.
- `removeItemFromRoom('itemName', *'roomName', *x_position, *y_position)`: Removes specified item from room. You can optionally specify which room it should be removed from, or if you have more than one of the same item, you can specify the item at a certain XY location
    - If you are using the XY position, and want it to be removed from the current room, replace `'roomName'` with `null` (no quotes)
- `removeAllItemsFromRoom('itemName', *'roomName')`: Removes all occurrences of the specified item from the (optionally specified) room.
- `removeAllItemsFromWorld('itemname')`: Removes all occurrences of the specified item from the entire world / game
- `swapItem('oldItemName', 'newItemName', 'roomName')`: Swaps an item with a new item in the same position.
- `moveItem('itemName', new_x, new_y, *ms_between_steps)`: **WARNING EXPERIMENTAL** this function allows you to tell an item to move from it's current position to a new one. It's pretty buggy, so use with caution.

---

## [Pixel Shaders](hacks\pixel_shader.js)

Once the Pixel Shader hack is installed, it can be called easily using [Sean's javascript from dialog hack](https://github.com/seleb/bitsy-hacks/blob/master/dist/javascript-dialog.js).

### Activating a shader
Activating and deactivating the shader effects are super simple. These will be added to a Bitsy dialog.

1. Set your desired shader by using `curShader = shaderName`
2. Turn on the shader by using `activateShader()`
3. Optionally set shader parameters with `shaderParams.parameterName = yourValue`
4. When you want to turn off the shader, call `deactivateShader()`

**Example:** `Whoa, the world is all wavy!(js "curShader = warpShader; activateShader(); shaderParams.amplitued = 100")` will set the shader to **warpShader**, turn it on, and then set the amplitude of the waves to 100, all from within a Bitsy dialog.

If you want your shader to activate when the game starts, instead of adding the code to a dialog, open your **.html** file and at the very bottom where it says `<body onload='startExportedGame();'>` add the code after the `;`
**EX:**`<body onload='startExportedGame(); curShader = warpShader; activateShader();'>`

### Shaders and Parameters

Below are the individual shaders which are included along with their editable parameters.

- `warpShader`: Makes the screen all wavy.
    - `speedDiv`: The speed of the waves is divided by this number. Lower number means faster waves.
    - `waveLength`: The width of each wave
    - `amplitude`: The height of each wave
- `chromaShader`: Adds a [chromatic aberration effect](https://en.wikipedia.org/wiki/Chromatic_aberration) (separates red green and blue like a broken TV).
    - `amplitude`: The ammount the colors are separated.
    - `fuzz`: If set to **true** it will add a fuzzy effect to the distortion. If set to **false** the effect will be sharp and clean.
    - `mix`: How much of the original image VS the effect is shown, **0** being no effect, and **100** being full effect.
- `shakeShader`: Screen shake effect. Good for earthquakes, or if you want to pretend you are in a Jason Bourne movie.
    - `amplitude`: Amount of shake
    - `frequency`: Distance between shakes. Default is **1** whcih is like an earthquake, but if you wanted to simulate a giant walking in the next froom you might want something bigger to give a gap between shakes.
- `spotlightShader`: Puts a spotlight around the character, or a position in the room.
    - `x`: The x position of the spotlight
    - `y`: The y position of the spotlight
    - `radius`: The radius of the spotlight
    - `fuzz`: **true** if you want the spotlight to have a soft edge, **false** if you want the spotlight to have a hard edge.
    - `fizziness`: How fuzzy you want the edge.
    - `followPlayer`: If this setting is set to **true** (which it is by default) it will ignore the XY parameters and follow the player avatar. If set to **false** it will stay at the specified XY position.

You can set, or change as many parameters as you want in a single dialog, simply by separating them with `;`
**EX:** `(js "shaderParams.radius = 100; shaderParams.fuzz = false")`. Parameters can also be changed at any time, from separate dialogs. 

---

### Writing your own shader

If you want to add your own shader, you need to understand how pixel shaders work, which will not be covered here.

To add your own shader, simply add your shader in a `<script></script>` tag anywhere on the page.

The declaration format is `function shaderName(args, canvasIn)`.

If you want editable parameters, you need to include the following code at the top of your shader which will expose the desired parameters to the `shaderParams` object.

```
if (shaderParams && shaderParams.name != "unique_id"){
    delete shaderParams;
    shaderParams = {
        p1: default_val,
        p2: devault_val
    }
}
```

The `args` input contains the following info:

- `args.pixel`: the current pixel. Contans pixel color, as well as used to set the output. If you want, for example, the red channel, use `args.pixel.r`. You will need to set each channel individually using `args.pixel.r = val`.
- `args.x` and `args.y`: x and y position of pixel in canvas.
- `args.buffer`: The full image as canvas **imgData** list. 
    - In order to get an X/Y pixel, use `ShaderFunc.getPixelIdx(canvasIn.width, x, y)` which will return the starting index of that pixel. Then use `startIdx + channelOffset` to get the desired channel.
    - **EX:** `ShaderFunc.getPixelIdx(canvasIn.width, 5, 3) + 1` will return the red channel of that pixel.
- `args.frameRandom`: This is a single random number that is generated per frame. Closest thing to a seeded random we are going to get in JS. 
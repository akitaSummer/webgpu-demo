import {
  CreateShapeWithLight,
  CreateSurfaceWithColormap,
  LightInputs,
} from "./surface";
import $ from "jquery";
import "./style.css";
import { ParametricSurfaceData, SimpleSurfaceData } from "./surface-data";
import {
  Breather,
  KleinBottle,
  Peaks,
  Seashell,
  SievertEnneper,
  Sinc,
  Sphere,
  Wellenkugel,
} from "./math-func";
import { CubeData, CylinderData, SphereData } from "./vertex_data";
import { CreateShapeWithTexture } from "./texture";
import { CreateChartWithTexture } from "./chart";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Klein Bottle Surface Chart</h1><br>
      <h2>Motion Control</h2>
      <div id="id-radio">
         <label><input type="radio" name="options" value="animation" checked>Animation</label>
         <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
      </div>
      <br>
      <h2>Set Parameters</h2>  
      <div class="grid1">
         <div class="item3">select image</div>
         <div class="item4">
            <select id="id-texture">
               <option value="whitesquare">White square</option>
               <option value="whitesquare2">White square 2</option>
               <option value="redsquare">Red square</option>
               <option value="redsquare2">Red square 2</option>
               <option value="greensquare">Green square</option>
               <option value="greensquare2">Green square 2</option>
               <option value="bluesquare">Blue square</option>                        
               <option value="bluesquare2">Blue square 2</option>     
               <option value="blacksquare">Black square</option>                        
               <option value="blacksquare2">Black square 2</option>                   
            </select>
         </div>
      </div>            
      <div class="grid1">
         <div class="item3">select colormap</div>
         <div class="item4">
            <select id="id-colormap">
               <option>jet</option>
               <option>autumn</option>
               <option>bone</option>
               <option>cool</option>
               <option>copper</option>
               <option>greys</option>
               <option>hot</option>
               <option>hsv</option>
               <option>spring</option>
               <option>summer</option>
               <option>winter</option>        
            </select>
         </div>
      </div>            
   </div>
   <div class="item2">
      <canvas id="canvas-webgpu"></canvas>
   </div>
</div>

`);

const CreateChart = async (
  textureFile: string,
  colormapName: string,
  isAnimation = true
) => {
  const data = ParametricSurfaceData(
    KleinBottle,
    0,
    Math.PI,
    0,
    2 * Math.PI,
    50,
    15,
    -2,
    2,
    -2,
    2,
    2,
    0,
    colormapName,
    [0, 0, 0]
  );
  await CreateChartWithTexture(
    data?.vertexData!,
    data?.normalData!,
    data?.uv1Data!,
    data?.colorData!,
    textureFile,
    isAnimation
  );
};

let textureFile = "whitesquare.png";
let colormapName = "jet";
let isAnimation = true;
CreateChart(textureFile, colormapName, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateChart(textureFile, colormapName, isAnimation);
});

$("#id-texture").on("change", function () {
  const ele = this as any;
  textureFile = ele.options[ele.selectedIndex].value + ".png";
  CreateChart(textureFile, colormapName, isAnimation);
});

$("#id-colormap").on("change", function () {
  const ele = this as any;
  colormapName = ele.options[ele.selectedIndex].text;
  CreateChart(textureFile, colormapName, isAnimation);
});

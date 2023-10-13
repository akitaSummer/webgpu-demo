import { CreateSurfaceWithColormap, LightInputs } from "./surface";
import $ from "jquery";
import "./style.css";
import {
  ParametricSurfaceData,
  SimpleSurfaceData,
  SimpleSurfaceMesh,
} from "./surface-data";
import { KleinBottle, Peaks, Sinc, Wellenkugel } from "./math-func";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Peaks Surface Chart with MSAA</h1><br>
      <h2>Motion Control</h2>
      <div id="id-radio">
         <label><input type="radio" name="options" value="animation" checked>Animation</label>
         <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
      </div>
      <br>
      <h2>Set Parameters</h2>  
      <div class="grid1">
         <div class="item3">2-side light</div>
         <div class="item4">
            <input id="id-istwoside" type="text" value="1" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">colormap</div>
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
      <div class="grid1">
         <div class="item3">mesh color</div>
         <div class="item4">
            <input id="id-color" type="text" value="0, 0, 0" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">sample count</div>
         <div class="item4">
            <input id="id-sample" type="text" value="1" />
         </div>
      </div>
      <br><button type="button" id="btn-redraw"><b>Redraw</b></button>
   </div>
   <div class="item2">
      <canvas id="canvas-webgpu"></canvas>
   </div>
</div>
 `);

const CreateSurface = async (
  colormapName: string,
  meshColor = [1, 1, 1],
  sampleCount = 1,
  isAnimation = true
) => {
  const data = SimpleSurfaceData(
    Peaks,
    -3,
    3,
    -3,
    3,
    30,
    30,
    2,
    0,
    colormapName
  );
  const mesh = SimpleSurfaceMesh(
    Peaks,
    -3,
    3,
    -3,
    3,
    30,
    30,
    2,
    0,
    [0, 0, 0],
    0
  );
  await CreateSurfaceWithColormap(
    data?.vertexData!,
    data?.normalData!,
    data?.colorData!,
    mesh!,
    meshColor,
    {},
    sampleCount,
    isAnimation
  );
};

let isAnimation = true;
let colormapName = "jet";
let meshColor = [0, 0, 0];
let sampleCount = 1;

CreateSurface(colormapName, meshColor, sampleCount, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateSurface(colormapName, meshColor, sampleCount, isAnimation);
});

$("#btn-redraw").on("click", function () {
  meshColor = $("#id-color").val()?.toString()!.split(",").map(Number)!;
  sampleCount = parseInt($("#id-sample").val()?.toString()!);
  CreateSurface(colormapName, meshColor, sampleCount, isAnimation);
});

$("#id-colormap").on("change", function () {
  const ele = this as any;
  colormapName = ele.options[ele.selectedIndex].text;
  CreateSurface(colormapName, meshColor, sampleCount, isAnimation);
});

window.addEventListener("resize", function () {
  CreateSurface(colormapName, meshColor, sampleCount, isAnimation);
});

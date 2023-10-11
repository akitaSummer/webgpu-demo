import {
  CreateShapeWithLight,
  CreateSurfaceWithColormap,
  LightInputs,
} from "./surface";
import $ from "jquery";
import "./style.css";
import { ParametricSurfaceData, SimpleSurfaceData } from "./surface-data";
import { KleinBottle, Peaks, Sinc } from "./math-func";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Klein Bottle</h1><br>
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
         <div class="item3">scale</div>
         <div class="item4">
            <input id="id-scale" type="text" value="2" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">scaley</div>
         <div class="item4">
            <input id="id-scaley" type="text" value="0" />
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
  li: LightInputs,
  isAnimation = true,
  colormapName = "jet",
  scale = 2,
  scaley = 0
) => {
  const data = ParametricSurfaceData(
    KleinBottle,
    0,
    Math.PI,
    0,
    2 * Math.PI,
    70,
    30,
    -2,
    2,
    -2,
    3,
    scale,
    scaley,
    colormapName
  );
  await CreateSurfaceWithColormap(
    data?.vertexData!,
    data?.normalData!,
    data?.colorData!,
    li,
    isAnimation
  );
};

let li: LightInputs = {};
let isAnimation = true;
let colormapName = "jet";
let scale = 2;
let scaley = 0;

CreateSurface(li, isAnimation, colormapName, scale, scaley);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

$("#btn-redraw").on("click", function () {
  li.isTwoSideLighting = parseFloat($("#id-istwoside").val()?.toString()!);
  scale = parseFloat($("#id-scale").val()?.toString()!);
  scaley = parseFloat($("#id-scaley").val()?.toString()!);
  CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

$("#id-colormap").on("change", function () {
  const ele = this as any;
  colormapName = ele.options[ele.selectedIndex].text;
  CreateSurface(li, isAnimation, colormapName, scale, scaley);
});

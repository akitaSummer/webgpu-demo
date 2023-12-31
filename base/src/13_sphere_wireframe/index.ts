import { CreateWireframe } from "./wireframe";
import { SphereWireframeData } from "./vertex_data";
import { vec3 } from "gl-matrix";
import $ from "jquery";
import "./style.css";

$("#app").html(`
<div style="margin-left:20px;">  
   <h1>Sphere Wireframe</h1><br>

   <div class="grid">
      <div class="item1">
         <h2>Motion Control</h2>
         <div id="id-radio">
            <label><input type="radio" name="options" value="animation" checked>Animation</label>
            <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
         </div>
         <br>
         <h2>Set Parameters</h2>  
         <div class="grid1">
            <div class="item3">center</div>
            <div class="item4">
               <input id="id-center" type="text" value="0, 0, 0" />
            </div>
         </div>
         <div class="grid1">
            <div class="item3">radius</div>
            <div class="item4">
               <input id="id-radius" type="text" value="2" />
            </div>
         </div>
         <div class="grid1">
            <div class="item3">u</div>
            <div class="item4">
               <input id="id-u" type="text" value="20" />
            </div>
         </div>
         <div class="grid1">
            <div class="item3">v</div>
            <div class="item4">
               <input id="id-v" type="text" value="15" />
            </div>
         </div>
         <br><button type="button" id="btn-redraw"><b>Redraw</b></button>
      </div>
      <div class="item2">
         <canvas id="canvas-webgpu" width="640" height="480"></canvas>
      </div>
   </div>
</div>
`);

const Create3DObject = async (
  radius: number,
  u: number,
  v: number,
  center: vec3,
  isAnimation: boolean
) => {
  const wireframeData = SphereWireframeData(
    radius,
    u,
    v,
    center
  ) as Float32Array;
  await CreateWireframe(wireframeData, isAnimation);
};

let radius = 2;
let u = 20;
let v = 15;
let center: vec3 = [0, 0, 0];
let isAnimation = true;

Create3DObject(radius, u, v, center, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  Create3DObject(radius, u, v, center, isAnimation);
});

$("#btn-redraw").on("click", function () {
  const val = $("#id-center").val();
  center = val?.toString().split(",").map(Number) as vec3;
  radius = parseFloat($("#id-radius").val()?.toString() as string);
  u = parseInt($("#id-u").val()?.toString() as string);
  v = parseInt($("#id-v").val()?.toString() as string);
  Create3DObject(radius, u, v, center, isAnimation);
});

import { CreateWireframe } from "./wireframe";
import { ConeWireframeData } from "./vertex_data";
import { vec3 } from "gl-matrix";
import $ from "jquery";
import "./style.css";

$("#app").html(`
<div style="margin-left:20px;">  
<h1>Cone Wireframe</h1><br>

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
         <div class="item3">rtop</div>
         <div class="item4">
            <input id="id-rtop" type="text" value="0.5" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">rbottom</div>
         <div class="item4">
            <input id="id-rbottom" type="text" value="2" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">height</div>
         <div class="item4">
            <input id="id-height" type="text" value="3" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">n</div>
         <div class="item4">
            <input id="id-n" type="text" value="20" />
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
  rtop: number,
  rbottom: number,
  height: number,
  n: number,
  center: vec3,
  isAnimation: boolean
) => {
  const wireframeData = ConeWireframeData(
    rtop,
    rbottom,
    height,
    n,
    center
  ) as Float32Array;
  await CreateWireframe(wireframeData, isAnimation);
};

let rtop = 0.5;
let rbottom = 2;
let height = 3;
let n = 20;
let center: vec3 = [0, 0, 0];
let isAnimation = true;

Create3DObject(rtop, rbottom, height, n, center, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  Create3DObject(rtop, rbottom, height, n, center, isAnimation);
});

$("#btn-redraw").on("click", function () {
  const val = $("#id-center").val();
  center = val?.toString().split(",").map(Number) as vec3;
  rtop = parseFloat($("#id-rtop").val()?.toString() as string);
  rbottom = parseFloat($("#id-rbottom").val()?.toString() as string);
  height = parseFloat($("#id-height").val()?.toString() as string);
  n = parseInt($("#id-n").val()?.toString() as string);
  Create3DObject(rtop, rbottom, height, n, center, isAnimation);
});

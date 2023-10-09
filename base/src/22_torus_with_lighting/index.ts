import { CreateShapeWithLight, LightInputs } from "./light";
import { CubeData, CylinderData, SphereData, TorusData } from "./vertex_data";
import $ from "jquery";
import "./style.css";
import { ResizeFunction } from "./helper";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Torus with Lighting</h1><br>
      <h2>Motion Control</h2>
      <div id="id-radio">
         <label><input type="radio" name="options" value="animation" checked>Animation</label>
         <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
      </div>
      <br>
      <h2>Set Parameters</h2>  
      <div class="grid1">
         <div class="item3">object color</div>
         <div class="item4">
            <input id="id-color" type="text" value="(1.0, 0.0, 0.0)" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">isPhong</div>
         <div class="item4">
            <input id="id-isphong" type="text" value="0" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">ambient</div>
         <div class="item4">
            <input id="id-ambient" type="text" value="0.1" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">diffuse</div>
         <div class="item4">
            <input id="id-diffuse" type="text" value="0.8" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">specular</div>
         <div class="item4">
            <input id="id-specular" type="text" value="0.4" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">shininess</div>
         <div class="item4">
            <input id="id-shininess" type="text" value="30.0" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">specular color</div>
         <div class="item4">
            <input id="id-scolor" type="text" value="(1.0, 1.0, 1.0)" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">rlarge</div>
         <div class="item4">
            <input id="id-rlarge" type="text" value="1.5" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">rsmall</div>
         <div class="item4">
            <input id="id-rsmall" type="text" value="0.4" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">nlarge</div>
         <div class="item4">
            <input id="id-nlarge" type="text" value="100" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">nsmall</div>
         <div class="item4">
            <input id="id-nsmall" type="text" value="50" />
         </div>
      </div>
      <br><button type="button" id="btn-redraw"><b>Redraw</b></button>
   </div>
   <div class="item2">
      <canvas id="canvas-webgpu"></canvas>
   </div>
</div>
`);

const CreateShape = async (
  li: LightInputs,
  rlarge = 1.5,
  rsmall = 0.4,
  nlarge = 100,
  nsmall = 50,
  isAnimation = true
) => {
  const data = TorusData(rlarge, rsmall, nlarge, nsmall);
  await CreateShapeWithLight(
    data?.vertexData!,
    data?.normalData!,
    li,
    isAnimation
  );
};

let rlarge = 1.5;
let rsmall = 0.4;
let nlarge = 100;
let nsmall = 50;
let li: LightInputs = {};
let isAnimation = true;

CreateShape(li, rlarge, rsmall, nlarge, nsmall, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateShape(li, rlarge, rsmall, nlarge, nsmall, isAnimation);
});
$("#btn-redraw").on("click", function () {
  li.color = $("#id-color").val()?.toString()?.split(",").map(Number) as any;
  li.ambientIntensity = parseFloat($("#id-ambient").val()?.toString()!);
  li.diffuseIntensity = parseFloat($("#id-diffuse").val()?.toString()!);
  li.specularIntensity = parseFloat($("#id-specular").val()?.toString()!);
  li.shininess = parseFloat($("#id-shininess").val()?.toString()!);
  li.specularColor = $("#id-scolor")
    .val()
    ?.toString()
    ?.split(",")
    .map(Number) as any;
  rlarge = parseFloat($("#id-rlarge").val()?.toString()!);
  rsmall = parseFloat($("#id-rsmall").val()?.toString()!);
  nlarge = parseInt($("#id-nlarge").val()?.toString()!);
  nsmall = parseInt($("#id-nsmall").val()?.toString()!);
  CreateShape(li, rlarge, rsmall, nlarge, nsmall, isAnimation);
});

ResizeFunction(CreateShape, [li, rlarge, rsmall, nlarge, nsmall, isAnimation]);

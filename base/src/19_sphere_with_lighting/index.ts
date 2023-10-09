import { CreateShapeWithLight, LightInputs } from "./light";
import { CubeData, SphereData } from "./vertex_data";
import $ from "jquery";
import "./style.css";

$("#app").html(`

<h1>Sphere with Lighting</h1><br>

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

const CreateShape = async (
  li: LightInputs,
  radius = 2,
  u = 20,
  v = 15,
  isAnimation = true
) => {
  const data = SphereData(radius, u, v);
  await CreateShapeWithLight(
    data?.vertexData!,
    data?.normalData!,
    li,
    isAnimation
  );
};

let radius = 2;
let u = 20;
let v = 15;
let li: LightInputs = {};
let isAnimation = true;

CreateShape(li, radius, u, v, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateShape(li, radius, u, v, isAnimation);
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
  radius = parseFloat($("#id-radius").val()?.toString()!);
  u = parseInt($("#id-u").val()?.toString()!);
  v = parseInt($("#id-v").val()?.toString()!);
  CreateShape(li, radius, u, v, isAnimation);
});

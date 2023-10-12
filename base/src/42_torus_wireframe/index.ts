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
  Wellenkugel,
} from "./math-func";
import { CubeData, CylinderData, SphereData } from "./vertex_data";
import { CreateShapeWithTexture } from "./texture";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Cube with Multiple Textures</h1><br>
      <h2>Motion Control</h2>
      <div id="id-radio">
         <label><input type="radio" name="options" value="animation" checked>Animation</label>
         <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
      </div>
      <br>
      <h2>Set Parameters</h2>              
      <div class="grid1">
         <div class="item3">shininess</div>
         <div class="item4">
            <input id="id-shininess" type="text" value="100.0" />
         </div>
      </div>
      <br><button type="button" id="btn-redraw"><b>Redraw</b></button>
   </div>
   <div class="item2">
      <canvas id="canvas-webgpu" width="640" height="480"></canvas>
   </div>
</div>

`);

const CreateShape = async (li: LightInputs = {}, isAnimation = true) => {
  const data = CubeData();
  await CreateShapeWithTexture(
    data?.positions,
    data?.normals,
    data?.uv1,
    "multiple.png",
    "repeat",
    "repeat",
    isAnimation
  );
};

let li: LightInputs = {};
let isAnimation = true;
CreateShape(li, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateShape(li, isAnimation);
});

$("#btn-redraw").on("click", function () {
  li.shininess = parseFloat($("#id-shininess").val()?.toString() as string);
  CreateShape(li, isAnimation);
});

function reportWindowSize() {
  CreateShape(li, isAnimation);
}
window.onresize = reportWindowSize;

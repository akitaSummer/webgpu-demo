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
      <h1>Peaks Surface with Texture</h1><br>
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
            <select id="id-image">
               <option value="brick">Brick</option>
               <option value="earth">Earth</option>
               <option value="grass">Grass</option>
               <option value="greatcanyon">Great Canyon</option>
               <option value="jiuzhaigou">Jiu Zhai Gou</option>
               <option value="marble">Marble</option>
               <option value="newyork">New York</option>
               <option value="wood">Wood</option>
               <option value="yellowstone">Yellow Stone</option>          
            </select>
         </div>
      </div>
      <div class="grid1">
         <div class="item3">u length</div>
         <div class="item4">
            <input id="id-ulength" type="text" value="1" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">v length</div>
         <div class="item4">
            <input id="id-vlength" type="text" value="1" />
         </div>
      </div>
      <div class="grid1">
         <div class="item3">address mode u</div>
         <div class="item4">
            <select id="id-addressu">
               <option value="repeat">repeat</option>
               <option value="clamp-to-edge">clamp-to-edge</option>                   
               <option value="mirror-repeat">mirror-repeat</option>                  
            </select>
         </div>
      </div>
      <div class="grid1">
         <div class="item3">address mode v</div>
         <div class="item4">
            <select id="id-addressv">
               <option value="repeat">repeat</option>
               <option value="clamp-to-edge">clamp-to-edge</option>                   
               <option value="mirror-repeat">mirror-repeat</option>                  
            </select>
         </div>
      </div>
      <div class="grid1">
         <div class="item3">shininess</div>
         <div class="item4">
            <input id="id-shininess" type="text" value="100.0" />
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
  ul: number,
  vl: number,
  textureFile: string,
  addressModeU: GPUAddressMode,
  addressModeV: GPUAddressMode,
  isAnimation: boolean
) => {
  const data = SimpleSurfaceData(
    Peaks,
    -3,
    3,
    -3,
    3,
    51,
    51,
    2,
    0,
    "",
    [0, 0, 0],
    ul,
    vl
  );

  await CreateShapeWithTexture(
    data?.vertexData!,
    data?.normalData!,
    data?.uvData!,
    textureFile,
    addressModeU,
    addressModeV,
    isAnimation
  );
};

let textureFile = "brick.png";
let addressModeU = "clamp-to-edge" as GPUAddressMode;
let addressModeV = "clamp-to-edge" as GPUAddressMode;
let isAnimation = true;
let ul = 1;
let vl = 1;
CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);

$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  if (val === "animation") isAnimation = true;
  else isAnimation = false;
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
});

$("#btn-redraw").on("click", function () {
  ul = parseFloat($("#id-ulength").val()?.toString() as string);
  vl = parseFloat($("#id-vlength").val()?.toString() as string);
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
});

$("#id-image").on("change", function () {
  const ele = this as any;
  textureFile = ele.options[ele.selectedIndex].value + ".png";
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
});

$("#id-addressu").on("change", function () {
  const ele = this as any;
  addressModeU = ele.options[ele.selectedIndex].value as GPUAddressMode;
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
});

$("#id-addressv").on("change", function () {
  const ele = this as any;
  addressModeV = ele.options[ele.selectedIndex].value;
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
});

function reportWindowSize() {
  CreateShape(ul, vl, textureFile, addressModeU, addressModeV, isAnimation);
}
window.onresize = reportWindowSize;

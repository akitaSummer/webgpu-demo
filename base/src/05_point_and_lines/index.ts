import $ from "jquery";
import { CheckWebGPU } from "./helper";
import shader from "./shader.wgsl";

$("#app").html(`
<div>  
  <h1>Create Point or Line Primitives</h1><br>
  <label><b>Select a primitive type:</b></label>
  <select id="id-primitive">
     <option value="point-list">point-list</option>
     <option value="line-list">line-list</option>
     <option value="line-strip">line-strip</option>
  </select>
  <br><br>
  <canvas id="canvas-webgpu" width="640" height="480"></canvas>
</div>

`);

const CreatePrimitive = async (primitiveType = "point-list") => {
  const checkgpu = CheckWebGPU();
  if (checkgpu.includes("Your current browser does not support WebGPU!")) {
    console.log(checkgpu);
    throw "Your current browser does not support WebGPU!";
  }

  let indexFormat = undefined;
  if (primitiveType === "line-strip") {
    indexFormat = "uint32";
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter;
  const device = (await adapter?.requestDevice()) as GPUDevice;
  const context = canvas.getContext("webgpu") as GPUCanvasContext;

  const format = "bgra8unorm";
  context.configure({
    device: device,
    format: format,
    alphaMode: "opaque",
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "fs_main",
      targets: [
        {
          format: format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: primitiveType as GPUPrimitiveTopology,
      stripIndexFormat: indexFormat as GPUIndexFormat,
    },
  });

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView as GPUTextureView,
        clearValue: [0.5, 0.5, 0.8, 1], //background color
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  renderPass.draw(6);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

CreatePrimitive();
$("#id-primitive").on("change", () => {
  const primitiveType = $("#id-primitive").val() as string;
  CreatePrimitive(primitiveType);
});

import "./style.css";
import $ from "jquery";
import { CheckWebGPU } from "./helper";
import shader from "./shader.wgsl";

$("#app").html(`
<div>  
<div class="grid">
  <div class="item1">
     <h1>Triangle with Vertex Color</h1><br>
  </div>
  <div class="item2">
     <canvas id="canvas-webgpu"></canvas>
  </div>
</div>
`);

const CreateTriangle = async () => {
  const checkgpu = CheckWebGPU();
  if (checkgpu.includes("Your current browser does not support WebGPU!")) {
    console.log(checkgpu);
    throw "Your current browser does not support WebGPU!";
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter;
  const device = (await adapter?.requestDevice()) as GPUDevice;
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  const format = "bgra8unorm";
  context.configure({
    device: device,
    format: format,
  });

  //const shader = Shaders();
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
          format: format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, //background color
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  renderPass.draw(3, 1, 0, 0);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

CreateTriangle();

window.addEventListener("resize", function () {
  CreateTriangle();
});

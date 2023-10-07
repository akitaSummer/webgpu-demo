import $ from "jquery";
import { CheckWebGPU, CreateGPUBuffer, InitGPU } from "./helper";
import shader from "./shader.wgsl";
import "./style.css";

$("#app").html(`
<div class="grid">
<div class="item1">
   <h1>Create Square using a Single GPU Buffer</h1><br>
</div>
<div class="item2">
   <canvas id="canvas-webgpu"></canvas>
</div>
</div>
`);

const CreateSquare = async () => {
  const gpu = await InitGPU();
  const device = gpu.device;
  // prettier-ignore
  const vertexData = new Float32Array([
    //position    //color
   -0.5, -0.5,    1, 0, 0,  // vertex a
    0.5, -0.5,    0, 1, 0,  // vertex b
   -0.5,  0.5,    1, 1, 0,  // vertex d
   -0.5,  0.5,    1, 1, 0,  // vertex d
    0.5, -0.5,    0, 1, 0,  // vertex b
    0.5,  0.5,    0, 0, 1   // vertex c
]);

  const vertexBuffer = CreateGPUBuffer(device, vertexData);

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 4 * (2 + 3),
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x2",
              offset: 0,
            },
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 8,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "fs_main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
    },
  });

  const commandEncoder = device.createCommandEncoder();
  const textureView = gpu.context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, //background color
        //clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(6);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

CreateSquare();

window.addEventListener("resize", function () {
  CreateSquare();
});

import $ from "jquery";
import { InitGPU, CreateGPUBuffer, CreateGPUBufferUint } from "./helper";
import shader from "./shader.wgsl";

$("#app").html(`
   <div>  
      <h1>Create Square using Index Buffer</h1><br>
      <canvas id="canvas-webgpu" width="640" height="480"></canvas>
    </div>
`);

const CreateSquare = async () => {
  const gpu = await InitGPU();
  const device = gpu.device;
  // prettier-ignore
  const vertexData = new Float32Array([
      //position    //color
     -0.5, -0.5,    1, 0, 0,  // vertex a, index = 0
      0.5, -0.5,    0, 1, 0,  // vertex b, index = 1
      0.5,  0.5,    0, 0, 1,  // vertex c, index = 2  
     -0.5,  0.5,    1, 1, 0   // vertex d, index = 3        
  ]);

  const indexData = new Uint32Array([0, 1, 3, 3, 1, 2]);

  const vertexBuffer = CreateGPUBuffer(device, vertexData);
  const indexBuffer = CreateGPUBufferUint(device, indexData);

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
  renderPass.setIndexBuffer(indexBuffer, "uint32");

  renderPass.drawIndexed(6);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

CreateSquare();

window.addEventListener("resize", function () {
  CreateSquare();
});

import $ from "jquery";
import { CheckWebGPU } from "./helper";
import { Shaders } from "./shaders";

$("#app").html(`
<div>  
<h1>Create Triangle</h1><br>
<label>Color:</label>
<input type="text" id="id-color" value="(1.0,1.0,1.0,1.0)">
<button type="button" id="id-btn">Change Color</button>
<br><br>
<canvas id="canvas-webgpu" width="640" height="480"></canvas>
</div>
`);

const CreateTriangle = async (color = "(1.0,1.0,1.0,1.0)") => {
  const checkgpu = CheckWebGPU();
  if (checkgpu.includes("Your current browser does not support WebGPU!")) {
    console.log(checkgpu);
    throw "Your current browser does not support WebGPU!";
  }

  const canvas = document.getElementById("canvas-webgpu") as HTMLCanvasElement;
  const adapter = (await navigator.gpu?.requestAdapter()) as GPUAdapter;
  const device = (await adapter?.requestDevice()) as GPUDevice;
  const context = canvas.getContext("webgpu") as unknown as GPUCanvasContext;
  // 输出模式
  const format = "bgra8unorm";
  /*const swapChain = context.configureSwapChain({
        device: device,
        format: format,
    });*/
  context.configure({
    device: device,
    format: format,
    alphaMode: "opaque",
  });

  const shader = Shaders(color);
  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader.vertex,
      }),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({
        code: shader.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: format as GPUTextureFormat,
        },
      ],
    },
    // 绘制模式
    primitive: {
      topology: "triangle-list",
    },
  });

  // 渲染通道编码器
  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.5, g: 0.5, b: 0.8, a: 1.0 }, //background color
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  // 定点数量 绘制实例数量
  renderPass.draw(3, 1, 0, 0);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
};

CreateTriangle();
$("#id-btn").on("click", () => {
  const color = $("#id-color").val() as string;
  CreateTriangle(color);
});

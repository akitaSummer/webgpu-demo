import $ from "jquery";
import {
  InitGPU,
  CreateGPUBuffer,
  CreateTransforms,
  CreateViewProjection,
  CreateAnimation,
  CreateGPUBufferUint,
} from "./helper";
import { CubeData } from "./vertex_data";
import { mat4, vec3 } from "gl-matrix";
import shader from "./shader.wgsl";
import "./style.css";

// @ts-ignore
import createCamera from "3d-view-controls";

$("#app").html(`
<div class="grid">
   <div class="item1">
      <h1>Cube with Distinct Vertex Color</h1><br>
      <h2>Motion Control</h2>
      <div id="id-radio">
         <label><input type="radio" name="options" value="animation" checked>Animation</label>
         <label style="margin-left:30px;"><input type="radio" name="options" value="camera">Camera Control</label>   
      </div>
      <br>
   </div>
   <div class="item2">
      <canvas id="canvas-webgpu"></canvas>
   </div>
</div>
`);

const Create3DObject = async (isAnimation = true) => {
  const gpu = await InitGPU();
  const device = gpu.device;

  // create vertex buffers
  const cubeData = CubeData();
  const numberOfVertices = cubeData.indexData.length;
  const vertexBuffer = CreateGPUBuffer(device, cubeData.vertexData);
  const indexBuffer = CreateGPUBufferUint(device, cubeData.indexData);

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 24,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 12,
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
      cullMode: "back",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
  });

  // create uniform data
  const modelMatrix = mat4.create();
  const mvpMatrix = mat4.create();
  let vMatrix = mat4.create();
  let vpMatrix = mat4.create();
  const vp = CreateViewProjection(gpu.canvas.width / gpu.canvas.height);
  vpMatrix = vp.viewProjectionMatrix;

  // add rotation and camera:
  let rotation = vec3.fromValues(0, 0, 0);
  const camera = createCamera(gpu.canvas, vp.cameraOption);

  // create uniform buffer and bind group
  const uniformBuffer = device.createBuffer({
    size: 64,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: uniformBuffer,
          offset: 0,
          size: 64,
        },
      },
    ],
  });

  let textureView = gpu.context.getCurrentTexture().createView();
  const depthTexture = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  const renderPassDescription = {
    colorAttachments: [
      {
        view: textureView,
        clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, //background color
        //loadValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0  },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthLoadValue: 1.0,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
      /*stencilClearValue: 0,
          stencilLoadValue: 0,
          stencilLoadOp: 'clear',
          stencilStoreOp: "store"*/
    },
  };

  CreateTransforms(modelMatrix);

  const draw = () => {
    if (!isAnimation) {
      if (camera.tick()) {
        const pMatrix = vp.projectionMatrix;
        vMatrix = camera.matrix;
        mat4.multiply(vpMatrix, pMatrix, vMatrix);
      }
    }

    CreateTransforms(modelMatrix, [0, 0, 0], rotation);
    mat4.multiply(mvpMatrix, vpMatrix, modelMatrix);
    device.queue.writeBuffer(uniformBuffer, 0, mvpMatrix as ArrayBuffer);
    textureView = gpu.context.getCurrentTexture().createView();
    renderPassDescription.colorAttachments[0].view = textureView;
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass(
      renderPassDescription as GPURenderPassDescriptor
    );

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setIndexBuffer(indexBuffer, "uint32");
    renderPass.setBindGroup(0, uniformBindGroup);
    renderPass.drawIndexed(numberOfVertices);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  };

  CreateAnimation(draw, rotation, isAnimation);
};

let is_animation = true;
Create3DObject(is_animation);
$("#id-radio input:radio").on("click", function () {
  let val = $('input[name="options"]:checked').val();
  is_animation = val === "animation" ? true : false;
  Create3DObject(is_animation);
});

window.addEventListener("resize", function () {
  Create3DObject(is_animation);
});

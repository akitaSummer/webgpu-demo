import {
  InitGPU,
  CreateGPUBuffer,
  CreateTransforms,
  CreateViewProjection,
  CreateAnimation,
} from "./helper";
import shader from "./shader.wgsl";
import meshShader from "./mesh.wgsl";
import { vec3, vec4, mat4 } from "gl-matrix";
// @ts-ignore
import createCamera from "3d-view-controls";

export interface LightInputs {
  color?: vec3;
  ambientIntensity?: number;
  diffuseIntensity?: number;
  specularIntensity?: number;
  shininess?: number;
  specularColor?: vec3;
  isTwoSideLighting?: number;
}

export const CreateSurfaceWithColormap = async (
  vertexData: Float32Array,
  normalData: Float32Array,
  colorData: Float32Array,
  meshData: Float32Array,
  meshData2: Float32Array,
  meshColor = [1.0, 1.0, 1.0],
  li: LightInputs,
  isAnimation = true
) => {
  const gpu = await InitGPU();
  const device = gpu.device;

  // define default parameters for th elight model
  li.ambientIntensity =
    li.ambientIntensity == undefined ? 0.1 : li.ambientIntensity;
  li.diffuseIntensity =
    li.diffuseIntensity == undefined ? 0.8 : li.diffuseIntensity;
  li.specularIntensity =
    li.specularIntensity == undefined ? 0.4 : li.specularIntensity;
  li.shininess = li.shininess == undefined ? 30.0 : li.shininess;
  li.specularColor =
    li.specularColor == undefined ? [1.0, 1.0, 1.0] : li.specularColor;
  li.isTwoSideLighting =
    li.isTwoSideLighting == undefined ? 1 : li.isTwoSideLighting;

  // create buffers for surface
  const numberOfVertices = vertexData.length / 3;
  const vertexBuffer = CreateGPUBuffer(device, vertexData);
  const normalBuffer = CreateGPUBuffer(device, normalData);
  const colorBuffer = CreateGPUBuffer(device, colorData);

  // create buffers for mesh
  const meshBuffer = CreateGPUBuffer(device, meshData);
  const meshBuffer2 = CreateGPUBuffer(device, meshData2);

  const uniformBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  // for mesh color
  const uniformBindGroupLayout1 = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout],
    }),
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 2,
              format: "float32x3",
              offset: 0,
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
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
    multisample: {
      count: 4,
    },
  });

  const pipelineMesh = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout, uniformBindGroupLayout1],
    }),
    vertex: {
      module: device.createShaderModule({
        code: meshShader,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: meshShader,
      }),
      entryPoint: "fs_main",
      targets: [
        {
          format: gpu.format as GPUTextureFormat,
        },
      ],
    },
    primitive: {
      topology: "line-list",
    },
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
    multisample: {
      count: 4,
    },
  });

  // create uniform data
  const normalMatrix = mat4.create();
  const modelMatrix = mat4.create();
  let vMatrix = mat4.create();
  let vpMatrix = mat4.create();
  const vp = CreateViewProjection(gpu.canvas.width / gpu.canvas.height);
  vpMatrix = vp.viewProjectionMatrix;

  // add rotation and camera:
  let rotation = vec3.fromValues(0, 0, 0);
  var camera = createCamera(gpu.canvas, vp.cameraOption);
  let eyePosition = new Float32Array(vp.cameraOption.eye);
  let lightPosition = eyePosition;

  // create uniform buffer
  const vertexUniformBuffer = device.createBuffer({
    size: 192,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const fragmentUniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  var lightParams = [] as any;
  lightParams.push([
    li.specularColor[0],
    li.specularColor[1],
    li.specularColor[2],
    1.0,
  ]);
  lightParams.push([
    li.ambientIntensity,
    li.diffuseIntensity,
    li.specularIntensity,
    li.shininess,
  ]);
  lightParams.push([li.isTwoSideLighting, 0, 0, 0]);

  const lightUniformBuffer = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  if (isAnimation) {
    device.queue.writeBuffer(
      vertexUniformBuffer,
      0,
      vp.viewProjectionMatrix as ArrayBuffer
    );
    device.queue.writeBuffer(fragmentUniformBuffer, 0, lightPosition);
    device.queue.writeBuffer(fragmentUniformBuffer, 16, eyePosition);
  }
  device.queue.writeBuffer(
    lightUniformBuffer,
    0,
    new Float32Array(lightParams.flat())
  );

  const meshColorUniformBuffer = device.createBuffer({
    size: 12,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(
    meshColorUniformBuffer,
    0,
    new Float32Array(meshColor)
  );

  const uniformBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: vertexUniformBuffer,
          offset: 0,
          size: 192,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: fragmentUniformBuffer,
          offset: 0,
          size: 32,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: lightUniformBuffer,
          offset: 0,
          size: 48,
        },
      },
    ],
  });

  const uniformBindGroup1 = device.createBindGroup({
    layout: uniformBindGroupLayout1,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: meshColorUniformBuffer,
          offset: 0,
          size: 12,
        },
      },
    ],
  });

  let contextTexture = gpu.context.getCurrentTexture();
  let texture = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    sampleCount: 4,
    format: gpu.format as GPUTextureFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const depthTexture = device.createTexture({
    size: [gpu.canvas.width, gpu.canvas.height, 1],
    sampleCount: 4,
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderPassDescription = {
    colorAttachments: [
      {
        view: texture.createView(),
        resolveTarget: contextTexture.createView(),
        clearValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 }, //background color
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  function draw() {
    if (!isAnimation) {
      if (camera.tick()) {
        const pMatrix = vp.projectionMatrix;
        vMatrix = camera.matrix;
        mat4.multiply(vpMatrix, pMatrix, vMatrix);

        eyePosition = new Float32Array(camera.eye.flat());
        lightPosition = eyePosition;
        device.queue.writeBuffer(
          vertexUniformBuffer,
          0,
          vpMatrix as ArrayBuffer
        );
        device.queue.writeBuffer(fragmentUniformBuffer, 0, eyePosition);
        device.queue.writeBuffer(fragmentUniformBuffer, 16, lightPosition);
      }
    }

    CreateTransforms(modelMatrix, [0, 0, 0], rotation);
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    device.queue.writeBuffer(
      vertexUniformBuffer,
      64,
      modelMatrix as ArrayBuffer
    );
    device.queue.writeBuffer(
      vertexUniformBuffer,
      128,
      normalMatrix as ArrayBuffer
    );

    contextTexture.destroy();
    texture.destroy();

    contextTexture = gpu.context.getCurrentTexture();
    texture = device.createTexture({
      size: [gpu.canvas.width, gpu.canvas.height, 1],
      sampleCount: 4,
      format: gpu.format as GPUTextureFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    renderPassDescription.colorAttachments[0].resolveTarget =
      contextTexture.createView();
    renderPassDescription.colorAttachments[0].view =
      texture.createView() as GPUTextureView;

    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass(
      renderPassDescription as GPURenderPassDescriptor
    );

    renderPass.setBindGroup(0, uniformBindGroup);
    renderPass.setBindGroup(1, uniformBindGroup1);

    // draw surface
    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, normalBuffer);
    renderPass.setVertexBuffer(2, colorBuffer);
    renderPass.draw(numberOfVertices);

    // draw wireframe 1
    renderPass.setPipeline(pipelineMesh);
    renderPass.setVertexBuffer(0, meshBuffer);
    renderPass.draw(meshData.length / 3);

    // draw wireframe 2
    renderPass.setPipeline(pipelineMesh);
    renderPass.setVertexBuffer(0, meshBuffer2);
    renderPass.draw(meshData2.length / 3);

    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  CreateAnimation(draw, rotation, isAnimation);
};

export const CreateShapeWithLight = async (
  vertexData: Float32Array,
  normalData: Float32Array,
  li: LightInputs,
  isAnimation = true
) => {
  const gpu = await InitGPU();
  const device = gpu.device;

  // define default parameters for th elight model
  li.color = li.color == undefined ? [1.0, 0.0, 0.0] : li.color;
  li.ambientIntensity =
    li.ambientIntensity == undefined ? 0.2 : li.ambientIntensity;
  li.diffuseIntensity =
    li.diffuseIntensity == undefined ? 0.8 : li.diffuseIntensity;
  li.specularIntensity =
    li.specularIntensity == undefined ? 0.4 : li.specularIntensity;
  li.shininess = li.shininess == undefined ? 30.0 : li.shininess;
  li.specularColor =
    li.specularColor == undefined ? [1.0, 1.0, 1.0] : li.specularColor;

  //console.log(JSON.stringify(li,null,4));

  // create vertex buffers
  const numberOfVertices = vertexData.length / 3;
  const vertexBuffer = CreateGPUBuffer(device, vertexData);
  const normalBuffer = CreateGPUBuffer(device, normalData);

  // create uniform data
  const normalMatrix = mat4.create();
  const modelMatrix = mat4.create();
  let vMatrix = mat4.create();
  let vpMatrix = mat4.create();
  const vp = CreateViewProjection(gpu.canvas.width / gpu.canvas.height);
  vpMatrix = vp.viewProjectionMatrix;

  // add rotation and camera:
  let rotation = vec3.fromValues(0, 0, 0);
  var camera = createCamera(gpu.canvas, vp.cameraOption);
  let eyePosition = new Float32Array(vp.cameraOption.eye);
  let lightPosition = eyePosition;

  // create uniform buffer and layout
  const vertexUniformBuffer = device.createBuffer({
    size: 192,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const fragmentUniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  var lightParams = [] as any;
  lightParams.push([li.color[0], li.color[1], li.color[2], 1.0]);
  lightParams.push([
    li.specularColor[0],
    li.specularColor[1],
    li.specularColor[2],
    1.0,
  ]);
  lightParams.push([
    li.ambientIntensity,
    li.diffuseIntensity,
    li.specularIntensity,
    li.shininess,
  ]);

  const lightUniformBuffer = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  if (isAnimation) {
    device.queue.writeBuffer(
      vertexUniformBuffer,
      0,
      vp.viewProjectionMatrix as ArrayBuffer
    );
    device.queue.writeBuffer(fragmentUniformBuffer, 0, lightPosition);
    device.queue.writeBuffer(fragmentUniformBuffer, 16, eyePosition);
  }
  device.queue.writeBuffer(
    lightUniformBuffer,
    0,
    new Float32Array(lightParams.flat())
  );

  console.log(JSON.stringify(lightParams, null, 4));
  console.log(JSON.stringify(new Float32Array(lightParams.flat()), null, 4));

  const uniformBindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.FRAGMENT,
        buffer: {
          type: "uniform",
        },
      },
    ],
  });

  const uniformBindGroup = device.createBindGroup({
    //layout: pipeline.getBindGroupLayout(0),
    layout: uniformBindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: vertexUniformBuffer,
          offset: 0,
          size: 192,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: fragmentUniformBuffer,
          offset: 0,
          size: 32,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: lightUniformBuffer,
          offset: 0,
          size: 48,
        },
      },
    ],
  });

  const pipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout],
    }),
    vertex: {
      module: device.createShaderModule({
        code: shader,
      }),
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 0,
              format: "float32x3",
              offset: 0,
            },
          ],
        },
        {
          arrayStride: 12,
          attributes: [
            {
              shaderLocation: 1,
              format: "float32x3",
              offset: 0,
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
    depthStencil: {
      format: "depth24plus",
      depthWriteEnabled: true,
      depthCompare: "less",
    },
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
        //loadValue: { r: 0.2, g: 0.247, b: 0.314, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadValue: 1.0,
      depthStoreOp: "store",
      depthLoadOp: "clear",
      /*stencilClearValue: 0,
          stencilLoadValue: 0,
          stencilStoreOp: "store",           
          stencilLoadOp: 'clear'*/
    },
  };

  const draw = () => {
    if (!isAnimation) {
      if (camera.tick()) {
        const pMatrix = vp.projectionMatrix;
        vMatrix = camera.matrix;
        mat4.multiply(vpMatrix, pMatrix, vMatrix);

        eyePosition = new Float32Array(camera.eye.flat());
        lightPosition = eyePosition;
        device.queue.writeBuffer(
          vertexUniformBuffer,
          0,
          vpMatrix as ArrayBuffer
        );
        device.queue.writeBuffer(fragmentUniformBuffer, 0, eyePosition);
        device.queue.writeBuffer(fragmentUniformBuffer, 16, lightPosition);
      }
    }

    CreateTransforms(modelMatrix, [0, 0, 0], rotation);
    mat4.invert(normalMatrix, modelMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    device.queue.writeBuffer(
      vertexUniformBuffer,
      64,
      modelMatrix as ArrayBuffer
    );
    device.queue.writeBuffer(
      vertexUniformBuffer,
      128,
      normalMatrix as ArrayBuffer
    );

    textureView = gpu.context.getCurrentTexture().createView();
    renderPassDescription.colorAttachments[0].view = textureView;
    const commandEncoder = device.createCommandEncoder();
    const renderPass = commandEncoder.beginRenderPass(
      renderPassDescription as GPURenderPassDescriptor
    );

    renderPass.setPipeline(pipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    renderPass.setVertexBuffer(1, normalBuffer);
    renderPass.setBindGroup(0, uniformBindGroup);
    renderPass.draw(numberOfVertices);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
  };

  CreateAnimation(draw, rotation, isAnimation);
};

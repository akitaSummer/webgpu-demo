import { vec2, vec3 } from "gl-matrix";
import { AddColors } from "./colormap-data";

export const ParametricSurfaceData = (
  f: any,
  umin: number,
  umax: number,
  vmin: number,
  vmax: number,
  nu: number,
  nv: number,
  xmin: number,
  xmax: number,
  zmin: number,
  zmax: number,
  scale = 1,
  scaley = 0,
  colormapName = "jet",
  center: vec3 = [0, 0, 0],
  ul = 1,
  vl = 1
) => {
  if (nu < 2 || nv < 2) return;
  const du = (umax - umin) / (nu - 1);
  const dv = (vmax - vmin) / (nv - 1);
  let pts = [] as any;
  let u: number, v: number;
  let pt: vec3;
  let ymin1 = 0,
    ymax1 = 0;

  let puv = [] as any;
  let puvn: vec2;

  for (let i = 0; i < nu; i++) {
    u = umin + i * du;
    let pt1 = [];
    let puv1 = [];
    for (let j = 0; j < nv; j++) {
      v = vmin + j * dv;
      pt = f(u, v, center);
      ymin1 = pt[1] < ymin1 ? pt[1] : ymin1;
      ymax1 = pt[1] > ymax1 ? pt[1] : ymax1;
      pt1.push(pt);
      puvn = NormalizeUVParametric(u, v, umin, umax, vmin, vmax, ul, vl);
      puv1.push(puvn);
    }
    pts.push(pt1);
    puv.push(puv1);
  }

  const ymin = ymin1 - scaley * (ymax1 - ymin1);
  const ymax = ymax1 + scaley * (ymax1 - ymin1);

  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      pts[i][j] = NormalizePoint(
        pts[i][j],
        xmin,
        xmax,
        ymin,
        ymax,
        zmin,
        zmax,
        scale
      );
    }
  }

  const cmin = NormalizePoint(
    vec3.fromValues(0, ymin1, 0),
    xmin,
    xmax,
    ymin,
    ymax,
    zmin,
    zmax,
    scale
  )[1];
  const cmax = NormalizePoint(
    vec3.fromValues(0, ymax1, 0),
    xmin,
    xmax,
    ymin,
    ymax,
    zmin,
    zmax,
    scale
  )[1];

  let p0: vec3, p1: vec3, p2: vec3, p3: vec3;
  let vertex = [] as any,
    normal = [] as any,
    color = [] as any;

  let pp0: vec2, pp1: vec2, pp2: vec2, pp3: vec2;
  let uv = [] as any;
  let uv1 = [] as any;

  for (let i = 0; i < nu - 1; i++) {
    for (let j = 0; j < nv - 1; j++) {
      p0 = pts[i][j];
      p1 = pts[i + 1][j];
      p2 = pts[i + 1][j + 1];
      p3 = pts[i][j + 1];
      let data = CreateQuad(p0, p1, p2, p3, cmin, cmax, colormapName);
      vertex.push(data.vertex.flat());
      normal.push(data.normal.flat());
      color.push(data.color.flat());

      //uv data
      pp0 = puv[i][j];
      pp1 = puv[i + 1][j];
      pp2 = puv[i + 1][j + 1];
      pp3 = puv[i][j + 1];
      let uvData = CreateQuadUV(pp0, pp1, pp2, pp3);
      uv.push(uvData.flat());

      // uv1 data
      uv1.push(0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0);
    }
  }
  return {
    vertexData: new Float32Array(vertex.flat()),
    normalData: new Float32Array(normal.flat()),
    colorData: new Float32Array(color.flat()),
    uvData: new Float32Array(uv.flat()),
    uv1Data: new Float32Array(uv1.flat()),
  };
};
export const SimpleSurfaceData = (
  f: any,
  xmin: number,
  xmax: number,
  zmin: number,
  zmax: number,
  nx: number,
  nz: number,
  scale = 1,
  scaley = 0,
  colormapName = "jet",
  center: vec3 = [0, 0, 0],
  ul = 1,
  vl = 1
) => {
  if (nx < 2 || nz < 2) return;
  const dx = (xmax - xmin) / (nx - 1);
  const dz = (zmax - zmin) / (nz - 1);
  let pts = [] as any;
  let x: number, z: number;
  let pt: vec3;
  let ymin1 = 0,
    ymax1 = 0;

  for (let i = 0; i < nx; i++) {
    x = xmin + i * dx;
    let pt1 = [];
    for (let j = 0; j < nz; j++) {
      z = zmin + j * dz;
      pt = f(x, z, center);
      pt1.push(pt);
      ymin1 = pt[1] < ymin1 ? pt[1] : ymin1;
      ymax1 = pt[1] > ymax1 ? pt[1] : ymax1;
    }
    pts.push(pt1);
  }

  const ymin = ymin1 - scaley * (ymax1 - ymin1);
  const ymax = ymax1 + scaley * (ymax1 - ymin1);

  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      pts[i][j] = NormalizePoint(
        pts[i][j],
        xmin,
        xmax,
        ymin,
        ymax,
        zmin,
        zmax,
        scale
      );
    }
  }

  const cmin = NormalizePoint(
    vec3.fromValues(0, ymin1, 0),
    xmin,
    xmax,
    ymin,
    ymax,
    zmin,
    zmax,
    scale
  )[1];
  const cmax = NormalizePoint(
    vec3.fromValues(0, ymax1, 0),
    xmin,
    xmax,
    ymin,
    ymax,
    zmin,
    zmax,
    scale
  )[1];

  let p0: vec3, p1: vec3, p2: vec3, p3: vec3;
  let vertex = [] as any,
    normal = [] as any,
    color = [] as any;
  let uv = [] as any;
  let uv1 = [] as any;
  for (let i = 0; i < nx - 1; i++) {
    for (let j = 0; j < nz - 1; j++) {
      p0 = pts[i][j];
      p1 = pts[i][j + 1];
      p2 = pts[i + 1][j + 1];
      p3 = pts[i + 1][j];
      let data = CreateQuad(
        p0,
        p1,
        p2,
        p3,
        cmin,
        cmax,
        colormapName,
        scale,
        ul,
        vl
      );
      vertex.push(data.vertex.flat());
      normal.push(data.normal.flat());
      color.push(data.color.flat());
      uv.push(data.uv.flat());
      uv1.push(0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0);
    }
  }

  return {
    vertexData: new Float32Array(vertex.flat()),
    normalData: new Float32Array(normal.flat()),
    colorData: new Float32Array(color.flat()),
    uvData: new Float32Array(uv.flat()),
    uv1Data: new Float32Array(uv1.flat()),
  };
};

//#region helper
const CreateQuadUV = (p0: vec2, p1: vec2, p2: vec2, p3: vec2) => {
  let uv = [] as any;
  // prettier-ignore
  uv.push([
    p0[0],p0[1],p1[0],p1[1],p2[0],p2[1],
    p2[0],p2[1],p3[0],p3[1],p0[0],p0[1]
]);
  return uv;
};

const NormalizeUVParametric = (
  u: number,
  v: number,
  umin: number,
  umax: number,
  vmin: number,
  vmax: number,
  ul = 1,
  vl = 1
) => {
  let uu = (ul * (u - umin)) / (umax - umin);
  let vv = (vl * (v - vmin)) / (vmax - vmin);
  return vec2.fromValues(uu, vv);
};
const NormalizeUV = (pt: vec3, scale = 1, ul = 1, vl = 1) => {
  let p0 = (ul * (1 + pt[0] / scale)) / 2;
  let p1 = (1 + pt[1] / scale) / 2;
  let p2 = (vl * (1 + pt[2] / scale)) / 2;
  return vec3.fromValues(p0, p1, p2);
};
const NormalizePoint = (
  pt: vec3,
  xmin: number,
  xmax: number,
  ymin: number,
  ymax: number,
  zmin: number,
  zmax: number,
  scale = 1
) => {
  pt[0] = scale * (-1 + (2 * (pt[0] - xmin)) / (xmax - xmin));
  pt[1] = scale * (-1 + (2 * (pt[1] - ymin)) / (ymax - ymin));
  pt[2] = scale * (-1 + (2 * (pt[2] - zmin)) / (zmax - zmin));
  return pt;
};

const CreateQuad = (
  p0: vec3,
  p1: vec3,
  p2: vec3,
  p3: vec3,
  ymin: number,
  ymax: number,
  colormapName: string,
  scale = 1,
  ul = 1,
  vl = 1
) => {
  let vertex = [] as any,
    normal = [] as any,
    color = [] as any;
  let ca: vec3, db: vec3, cp: vec3;
  // prettier-ignore
  //vertex data
  vertex.push([
      p0[0],p0[1],p0[2],p1[0],p1[1],p1[2],p2[0],p2[1],p2[2],
      p2[0],p2[1],p2[2],p3[0],p3[1],p3[2],p0[0],p0[1],p0[2]
  ]);

  //normal data
  ca = vec3.subtract(vec3.create(), p2, p0);
  db = vec3.subtract(vec3.create(), p3, p1);
  cp = vec3.cross(vec3.create(), ca, db);
  vec3.normalize(cp, cp);
  // prettier-ignore
  normal.push([
     cp[0],cp[1],cp[2],cp[0],cp[1],cp[2],cp[0],cp[1],cp[2],
     cp[0],cp[1],cp[2],cp[0],cp[1],cp[2],cp[0],cp[1],cp[2]
 ]);

  //color data
  let c0 = AddColors(colormapName, ymin, ymax, p0[1]);
  let c1 = AddColors(colormapName, ymin, ymax, p1[1]);
  let c2 = AddColors(colormapName, ymin, ymax, p2[1]);
  let c3 = AddColors(colormapName, ymin, ymax, p3[1]);
  // prettier-ignore
  color.push([
     c0[0],c0[1],c0[2],c1[0],c1[1],c1[2],c2[0],c2[1],c2[2],
     c2[0],c2[1],c2[2],c3[0],c3[1],c3[2],c0[0],c0[1],c0[2]
 ]);

  //uv data
  let uv = [] as any;
  let pp0 = NormalizeUV(p0, scale, ul, vl);
  let pp1 = NormalizeUV(p1, scale, ul, vl);
  let pp2 = NormalizeUV(p2, scale, ul, vl);
  let pp3 = NormalizeUV(p3, scale, ul, vl);
  // prettier-ignore
  uv.push([
      pp0[0], pp0[2], pp1[0], pp1[2], pp2[0], pp2[2],
      pp2[0], pp2[2], pp3[0], pp3[2], pp0[0], pp0[2]
 ]);

  return {
    vertex,
    normal,
    color,
    uv,
  };
};

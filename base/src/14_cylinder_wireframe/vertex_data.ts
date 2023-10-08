import { vec3 } from "gl-matrix";
import { SpherePosition, CylinderPosition } from "./math-func";

export const CylinderWireframeData = (
  rin: number,
  rout: number,
  height: number,
  n: number,
  center: vec3 = [0, 0, 0]
) => {
  if (n < 2 || rin >= rout) return;
  let pts = [] as any,
    h = height / 2;

  for (let i = 0; i < n; i++) {
    pts.push([
      CylinderPosition(rout, (i * 360) / (n - 1), h, center),
      CylinderPosition(rout, (i * 360) / (n - 1), -h, center),
      CylinderPosition(rin, (i * 360) / (n - 1), -h, center),
      CylinderPosition(rin, (i * 360) / (n - 1), h, center),
    ]);
  }

  let p = [] as any;
  let p0, p1, p2, p3, p4, p5, p6, p7;
  for (let i = 0; i < n - 1; i++) {
    p0 = pts[i][0];
    p1 = pts[i][1];
    p2 = pts[i][2];
    p3 = pts[i][3];
    p4 = pts[i + 1][0];
    p5 = pts[i + 1][1];
    p6 = pts[i + 1][2];
    p7 = pts[i + 1][3];

    p.push([
      //top face – 3 lines
      p0[0],
      p0[1],
      p0[2],
      p3[0],
      p3[1],
      p3[2],
      p3[0],
      p3[1],
      p3[2],
      p7[0],
      p7[1],
      p7[2],
      p4[0],
      p4[1],
      p4[2],
      p0[0],
      p0[1],
      p0[2],

      //bottom face – 3 lines
      p1[0],
      p1[1],
      p1[2],
      p2[0],
      p2[1],
      p2[2],
      p2[0],
      p2[1],
      p2[2],
      p6[0],
      p6[1],
      p6[2],
      p5[0],
      p5[1],
      p5[2],
      p1[0],
      p1[1],
      p1[2],

      //side – 2 lines
      p0[0],
      p0[1],
      p0[2],
      p1[0],
      p1[1],
      p1[2],
      p3[0],
      p3[1],
      p3[2],
      p2[0],
      p2[1],
      p2[2],
    ]);
  }
  return new Float32Array(p.flat());
};

export const SphereWireframeData = (
  radius: number,
  u: number,
  v: number,
  center: vec3 = [0, 0, 0]
) => {
  if (u < 2 || v < 2) return;
  let pts = [];
  let pt: vec3;
  for (let i = 0; i < u; i++) {
    let pt1: vec3[] = [];
    for (let j = 0; j < v; j++) {
      pt = SpherePosition(
        radius,
        (i * 180) / (u - 1),
        (j * 360) / (v - 1),
        center
      );
      pt1.push(pt);
    }
    pts.push(pt1);
  }

  let p = [] as any;
  let p0, p1, p2, p3;
  for (let i = 0; i < u - 1; i++) {
    for (let j = 0; j < v - 1; j++) {
      p0 = pts[i][j];
      p1 = pts[i + 1][j];
      //p2 = pts[i+1][j+1];
      p3 = pts[i][j + 1];
      p.push([
        p0[0],
        p0[1],
        p0[2],
        p1[0],
        p1[1],
        p1[2],
        p0[0],
        p0[1],
        p0[2],
        p3[0],
        p3[1],
        p3[2],
      ]);
    }
  }
  return new Float32Array(p.flat());
};

import glsl from "vite-plugin-glsl";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { defineConfig } from "vite";

export default defineConfig({
  // @ts-ignore
  plugins: [glsl(), resolve(), commonjs()],

  define: {
    "process.env": {},
    global: {},
  },
});

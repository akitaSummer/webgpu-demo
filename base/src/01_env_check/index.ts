import $ from "jquery";
import { CheckWebGPU } from "./helper";

$("#app").html(`
<h1>Check whether your browser support WebGPU or not:</h1>
<h2 id="id-gpu-check"></h2>
`);

$("#id-gpu-check").html(CheckWebGPU());

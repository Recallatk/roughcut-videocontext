import vertexShader from "./verticalWipe.vert";
import fragmentShader from "./verticalWipe.frag";

const verticalWipe = {
    title: "vertical Wipe",
    description: "A vertical wipe effect. Typically used as a transistion.",
    vertexShader,
    fragmentShader,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

export default verticalWipe;

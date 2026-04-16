(function(e,t){typeof exports==`object`&&typeof module<`u`?module.exports=t():typeof define==`function`&&define.amd?define([],t):(e=typeof globalThis<`u`?globalThis:e||self,e.VideoContext=t())})(this,function(){var e={AAF_VIDEO_SCALE:{title:`AAF Video Scale Effect`,description:`A scale effect based on the AAF spec.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float scaleX;
uniform float scaleY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`,properties:{scaleX:{type:`uniform`,value:1},scaleY:{type:`uniform`,value:1}},inputs:[`u_image`]},CROSSFADE:{title:`Cross-Fade`,description:`A cross-fade effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    color_a[0] *= (1.0 - mix);
    color_a[1] *= (1.0 - mix);
    color_a[2] *= (1.0 - mix);
    color_a[3] *= (1.0 - mix);
    color_b[0] *= mix;
    color_b[1] *= mix;
    color_b[2] *= mix;
    color_b[3] *= mix;
    gl_FragColor = color_a + color_b;
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},DREAMFADE:{title:`Dream-Fade`,description:`A wobbly dream effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    float wobble = 1.0 - abs((mix*2.0)-1.0);
    vec2 pos = vec2(v_texCoord[0] + ((sin(v_texCoord[1]*(10.0*wobble*3.14) + wobble*10.0)/13.0)), v_texCoord[1]);
    vec4 color_a = texture2D(u_image_a, pos);
    vec4 color_b = texture2D(u_image_b, pos);
    color_a[0] *= (1.0 - mix);
    color_a[1] *= (1.0 - mix);
    color_a[2] *= (1.0 - mix);
    color_a[3] *= (1.0 - mix);
    color_b[0] *= mix;
    color_b[1] *= mix;
    color_b[2] *= mix;
    color_b[3] *= mix;
    gl_FragColor = color_a + color_b;
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},HORIZONTAL_WIPE:{title:`Horizontal Wipe`,description:`A horizontal wipe effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (v_texCoord[0] > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},VERTICAL_WIPE:{title:`vertical Wipe`,description:`A vertical wipe effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (v_texCoord[1] > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},RANDOM_DISSOLVE:{title:`Random Dissolve`,description:`A random dissolve effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (clamp(rand(v_texCoord),  0.01, 1.001) > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},STATIC_DISSOLVE:{title:`Static Dissolve`,description:`A static dissolve effect. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform float currentTime;
varying vec2 v_texCoord;
varying float v_mix;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    if (clamp(rand(v_texCoord, currentTime),  0.01, 1.001) > mix){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`,properties:{mix:{type:`uniform`,value:0}},inputs:[`u_image_a`,`u_image_b`]},STATIC_EFFECT:{title:`Static`,description:`A static effect to add pseudo random noise to a video`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float currentTime;
uniform float amount;
varying vec2 v_texCoord;
uniform vec3 weight;
float rand(vec2 co, float currentTime){
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);
}
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[0] = color[0] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[0] * amount;
    color[1] = color[1] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[1] * amount;
    color[2] = color[2] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[2] *amount;
    gl_FragColor = color;
}
`,properties:{weight:{type:`uniform`,value:[1,1,1]},amount:{type:`uniform`,value:1}},inputs:[`u_image`]},TO_COLOR_AND_BACK:{title:`To Color And Back Fade`,description:`A fade to black and back effect. Setting mix to 0.5 is a fully solid color frame. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
uniform vec4 color;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color_a = texture2D(u_image_a, v_texCoord);
    vec4 color_b = texture2D(u_image_b, v_texCoord);
    float mix_amount = (mix *2.0) - 1.0;
    if(mix_amount < 0.0){
        gl_FragColor = abs(mix_amount) * color_a + (1.0 - abs(mix_amount)) * color;
    } else {
        gl_FragColor = mix_amount * color_b + (1.0 - mix_amount) * color;
    }
}
`,properties:{mix:{type:`uniform`,value:0},color:{type:`uniform`,value:[0,0,0,0]}},inputs:[`u_image_a`,`u_image_b`]},STAR_WIPE:{title:`Star Wipe Fade`,description:`A classic star wipe transistion. Typically used as a transistion.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image_a;
uniform sampler2D u_image_b;
uniform float mix;
varying vec2 v_texCoord;
varying float v_mix;
float sign (vec2 p1, vec2 p2, vec2 p3){
    return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}
bool pointInTriangle(vec2 pt, vec2 v1, vec2 v2, vec2 v3){
    bool b1, b2, b3;
    b1 = sign(pt, v1, v2) < 0.0;
    b2 = sign(pt, v2, v3) < 0.0;
    b3 = sign(pt, v3, v1) < 0.0;
    return ((b1 == b2) && (b2 == b3));
}
vec2 rotatePointAboutPoint(vec2 point, vec2 pivot, float angle){
    float s = sin(angle);
    float c = cos(angle);
    float x = point[0] - pivot[0];
    float y = point[1] - pivot[1];
    float new_x = x * c - y * s;
    float new_y = x * s + y * c;
    return vec2(new_x + pivot[0], new_y+pivot[1]);
}

void main(){
    vec4 color_a = texture2D(u_image_b, v_texCoord);
    vec4 color_b = texture2D(u_image_a, v_texCoord);
    vec2 t0_p0,t0_p1,t0_p2,t1_p0,t1_p1,t1_p2,t2_p0,t2_p1,t2_p2,t3_p0,t3_p1,t3_p2;
    vec2 t4_p0,t4_p1,t4_p2,t5_p0,t5_p1,t5_p2,t6_p0,t6_p1,t6_p2,t7_p0,t7_p1,t7_p2;


    t0_p0 = vec2(0.0, 0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);
    t0_p1 = vec2(0.0, -0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);
    t0_p2 = vec2(1.0, 0.0) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);

    t1_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854);
    t1_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854);
    t1_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854);

    t2_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 2.0);
    t2_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 2.0);
    t2_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 2.0);

    t3_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 3.0);
    t3_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 3.0);
    t3_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 3.0);

    t4_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 4.0);
    t4_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 4.0);
    t4_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 4.0);

    t5_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 5.0);
    t5_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 5.0);
    t5_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 5.0);

    t6_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 6.0);
    t6_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 6.0);
    t6_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 6.0);

    t7_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 7.0);
    t7_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 7.0);
    t7_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 7.0);

    if(mix > 0.99){
        gl_FragColor = color_a;
        return;
    }
    if(mix < 0.01){
        gl_FragColor = color_b;
        return;
    }
    if(pointInTriangle(v_texCoord, t0_p0, t0_p1, t0_p2) || pointInTriangle(v_texCoord, t1_p0, t1_p1, t1_p2) || pointInTriangle(v_texCoord, t2_p0, t2_p1, t2_p2) || pointInTriangle(v_texCoord, t3_p0, t3_p1, t3_p2) || pointInTriangle(v_texCoord, t4_p0, t4_p1, t4_p2) || pointInTriangle(v_texCoord, t5_p0, t5_p1, t5_p2) || pointInTriangle(v_texCoord, t6_p0, t6_p1, t6_p2) || pointInTriangle(v_texCoord, t7_p0, t7_p1, t7_p2)){
        gl_FragColor = color_a;
    } else {
        gl_FragColor = color_b;
    }
}
`,properties:{mix:{type:`uniform`,value:1}},inputs:[`u_image_a`,`u_image_b`]},COMBINE:{title:`Combine`,description:`A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float a;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    gl_FragColor = color;
}
`,properties:{a:{type:`uniform`,value:0}},inputs:[`u_image`]},COLORTHRESHOLD:{title:`Color Threshold`,description:`Turns all pixels with a greater value than the specified threshold transparent.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float a;
uniform vec3 colorAlphaThreshold;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`,properties:{a:{type:`uniform`,value:0},colorAlphaThreshold:{type:`uniform`,value:[0,.55,0]}},inputs:[`u_image`]},MONOCHROME:{title:`Monochrome`,description:`Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform vec3 inputMix;
uniform vec3 outputMix;
varying vec2 v_texCoord;
varying float v_mix;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];
    color[0] = mono * outputMix[0];
    color[1] = mono * outputMix[1];
    color[2] = mono * outputMix[2];
    gl_FragColor = color;
}
`,properties:{inputMix:{type:`uniform`,value:[.4,.6,.2]},outputMix:{type:`uniform`,value:[1,1,1]}},inputs:[`u_image`]},HORIZONTAL_BLUR:{title:`Horizontal Blur`,description:`A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
uniform float blurAmount;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);
    v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);
    v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);
    v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);
    v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);
    v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);
    v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);
    v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);
    v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);
    v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);
    v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);
    v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);
    v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);
    v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main(){
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;
}
`,properties:{blurAmount:{type:`uniform`,value:1}},inputs:[`u_image`]},VERTICAL_BLUR:{title:`Vertical Blur`,description:`A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
uniform float blurAmount;
varying vec2 v_blurTexCoords[14];
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
    v_blurTexCoords[ 0] = v_texCoord + vec2(0.0,-0.028 * blurAmount);
    v_blurTexCoords[ 1] = v_texCoord + vec2(0.0,-0.024 * blurAmount);
    v_blurTexCoords[ 2] = v_texCoord + vec2(0.0,-0.020 * blurAmount);
    v_blurTexCoords[ 3] = v_texCoord + vec2(0.0,-0.016 * blurAmount);
    v_blurTexCoords[ 4] = v_texCoord + vec2(0.0,-0.012 * blurAmount);
    v_blurTexCoords[ 5] = v_texCoord + vec2(0.0,-0.008 * blurAmount);
    v_blurTexCoords[ 6] = v_texCoord + vec2(0.0,-0.004 * blurAmount);
    v_blurTexCoords[ 7] = v_texCoord + vec2(0.0, 0.004 * blurAmount);
    v_blurTexCoords[ 8] = v_texCoord + vec2(0.0, 0.008 * blurAmount);
    v_blurTexCoords[ 9] = v_texCoord + vec2(0.0, 0.012 * blurAmount);
    v_blurTexCoords[10] = v_texCoord + vec2(0.0, 0.016 * blurAmount);
    v_blurTexCoords[11] = v_texCoord + vec2(0.0, 0.020 * blurAmount);
    v_blurTexCoords[12] = v_texCoord + vec2(0.0, 0.024 * blurAmount);
    v_blurTexCoords[13] = v_texCoord + vec2(0.0, 0.028 * blurAmount);
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying vec2 v_blurTexCoords[14];
void main(){
    gl_FragColor = vec4(0.0);
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;
    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;
}
`,properties:{blurAmount:{type:`uniform`,value:1}},inputs:[`u_image`]},AAF_VIDEO_CROP:{title:`AAF Video Crop Effect`,description:`A crop effect based on the AAF spec.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float cropLeft;
uniform float cropRight;
uniform float cropTop;
uniform float cropBottom;
varying vec2 v_texCoord;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);
    gl_FragColor = color;
}
`,properties:{cropLeft:{type:`uniform`,value:-1},cropRight:{type:`uniform`,value:1},cropTop:{type:`uniform`,value:-1},cropBottom:{type:`uniform`,value:1}},inputs:[`u_image`]},AAF_VIDEO_POSITION:{title:`AAF Video Position Effect`,description:`A position effect based on the AAF spec.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float positionOffsetX;
uniform float positionOffsetY;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = vec2(v_texCoord[0] - positionOffsetX/2.0, v_texCoord[1] -  positionOffsetY/2.0);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`,properties:{positionOffsetX:{type:`uniform`,value:0},positionOffsetY:{type:`uniform`,value:0}},inputs:[`u_image`]},AAF_VIDEO_FLIP:{title:`AAF Video Flip Effect`,description:`A flip effect based on the AAF spec. Mirrors the image in the x-axis`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main(){
    vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);
    vec4 color = texture2D(u_image, coord);
    gl_FragColor = color;
}
`,properties:{},inputs:[`u_image`]},AAF_VIDEO_FLOP:{title:`AAF Video Flop Effect`,description:`A flop effect based on the AAF spec. Mirrors the image in the y-axis`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
void main(){
    vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);
    vec4 color = texture2D(u_image, coord);
    gl_FragColor = color;
}
`,properties:{},inputs:[`u_image`]},OPACITY:{title:`Opacity`,description:`Sets the opacity of an input.`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float opacity;
varying vec2 v_texCoord;
varying float v_opacity;
void main(){
    vec4 color = texture2D(u_image, v_texCoord);
    color[3] *= opacity;
    gl_FragColor = color;
}
`,properties:{opacity:{type:`uniform`,value:.7}},inputs:[`u_image`]},CROP:{title:`Primer Simple Crop`,description:`A simple crop processors for primer`,vertexShader:`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,fragmentShader:`precision mediump float;
uniform sampler2D u_image;
uniform float x;
uniform float y;
uniform float width;
uniform float height;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    vec2 pos = (((v_texCoord)*vec2(width, height)) + vec2(0, 1.0-height)) +vec2(x,-y);
    vec4 color = texture2D(u_image, pos);
    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){
        color = vec4(0.0,0.0,0.0,0.0);
    }
    gl_FragColor = color;
}
`,properties:{x:{type:`uniform`,value:0},y:{type:`uniform`,value:0},width:{type:`uniform`,value:1},height:{type:`uniform`,value:1}},inputs:[`u_image`]}},t=`GraphNode`,n=class{constructor(e,n,r,i=!1){this._renderGraph=n,this._limitConnections=i,this._inputNames=r,this._destroyed=!1,this._gl=e,this._renderGraph=n,this._rendered=!1,this._displayName=t}get displayName(){return this._displayName}get inputNames(){return this._inputNames.slice()}get maximumConnections(){return this._limitConnections===!1?1/0:this._inputNames.length}get inputs(){let e=this._renderGraph.getInputsForNode(this);return e=e.filter(function(e){return e!==void 0}),e}get outputs(){return this._renderGraph.getOutputsForNode(this)}get destroyed(){return this._destroyed}connect(e,t){return this._renderGraph.registerConnection(this,e,t)}disconnect(e){if(e===void 0){let e=this._renderGraph.getOutputsForNode(this);return e.forEach(e=>this._renderGraph.unregisterConnection(this,e)),e.length>0}return this._renderGraph.unregisterConnection(this,e)}destroy(){this.disconnect();for(let e of this.inputs)e.disconnect(this);this._destroyed=!0}},r={waiting:0,sequenced:1,playing:2,paused:3,ended:4,error:5},i=`SourceNode`,a=class extends n{constructor(e,t,n,a){super(t,n,[],!0),this._element=void 0,this._elementURL=void 0,this._isResponsibleForElementLifeCycle=!0,typeof e==`string`||window.MediaStream!==void 0&&e instanceof MediaStream?this._elementURL=e:(this._element=e,this._isResponsibleForElementLifeCycle=!1),this._state=r.waiting,this._currentTime=a,this._startTime=NaN,this._stopTime=1/0,this._ready=!1,this._loadCalled=!1,this._stretchPaused=!1,this._texture=k(t),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),this._callbacks=[],this._renderPaused=!1,this._displayName=i}get state(){return this._state}get element(){return this._element}get duration(){if(!isNaN(this._startTime))return this._stopTime===1/0?1/0:this._stopTime-this._startTime}set stretchPaused(e){this._stretchPaused=e}get stretchPaused(){return this._stretchPaused}_load(){this._loadCalled||=(this._triggerCallbacks(`load`),!0)}_unload(){this._triggerCallbacks(`destroy`),this._loadCalled=!1}registerCallback(e,t){this._callbacks.push({type:e,func:t})}unregisterCallback(e){let t=[];for(let n of this._callbacks)(e===void 0||n.func===e)&&t.push(n);for(let e of t){let t=this._callbacks.indexOf(e);this._callbacks.splice(t,1)}}_triggerCallbacks(e,t){for(let n of this._callbacks)n.type===e&&(t===void 0?n.func(this):n.func(this,t))}start(e){return this._state===r.waiting?(this._startTime=this._currentTime+e,this._state=r.sequenced,!0):(console.debug(`SourceNode is has already been sequenced. Can't sequence twice.`),!1)}startAt(e){return this._state===r.waiting?(this._startTime=e,this._state=r.sequenced,!0):(console.debug(`SourceNode is has already been sequenced. Can't sequence twice.`),!1)}get startTime(){return this._startTime}stop(e){return this._state===r.ended?(console.debug(`SourceNode has already ended. Cannot call stop.`),!1):this._state===r.waiting?(console.debug(`SourceNode must have start called before stop is called`),!1):this._currentTime+e<=this._startTime?(console.debug(`SourceNode must have a stop time after it's start time, not before.`),!1):(this._stopTime=this._currentTime+e,this._stretchPaused=!1,this._triggerCallbacks(`durationchange`,this.duration),!0)}stopAt(e){return this._state===r.ended?(console.debug(`SourceNode has already ended. Cannot call stop.`),!1):this._state===r.waiting?(console.debug(`SourceNode must have start called before stop is called`),!1):e<=this._startTime?(console.debug(`SourceNode must have a stop time after it's start time, not before.`),!1):(this._stopTime=e,this._stretchPaused=!1,this._triggerCallbacks(`durationchange`,this.duration),!0)}get stopTime(){return this._stopTime}_seek(e){this._renderPaused=!1,this._triggerCallbacks(`seek`,e),this._state!==r.waiting&&(e<this._startTime&&(j(this._gl,this._texture),this._state=r.sequenced),e>=this._startTime&&this._state!==r.paused&&(this._state=r.playing),e>=this._stopTime&&(j(this._gl,this._texture),this._triggerCallbacks(`ended`),this._state=r.ended),this._currentTime=e)}_pause(){(this._state===r.playing||this._currentTime===0&&this._startTime===0)&&(this._triggerCallbacks(`pause`),this._state=r.paused,this._renderPaused=!1)}_play(){this._state===r.paused&&(this._triggerCallbacks(`play`),this._state=r.playing)}_isReady(){return this._buffering?!1:this._state===r.playing||this._state===r.paused||this._state===r.error?this._ready:!0}_update(e,t=!0){this._rendered=!0;let n=e-this._currentTime;return this._currentTime=e,this._state===r.waiting||this._state===r.ended||this._state===r.error?!1:(this._triggerCallbacks(`render`,e),e<this._startTime&&(j(this._gl,this._texture),this._state=r.sequenced),e>=this._startTime&&this._state!==r.paused&&this._state!==r.error&&(this._state!==r.playing&&this._triggerCallbacks(`play`),this._state=r.playing),e>=this._stopTime&&(j(this._gl,this._texture),this._triggerCallbacks(`ended`),this._state=r.ended),this._element===void 0||this._ready===!1?!0:(!this._renderPaused&&this._state===r.paused&&(t&&A(this._gl,this._texture,this._element),this._renderPaused=!0),this._state===r.playing&&(t&&A(this._gl,this._texture,this._element),this._stretchPaused&&(this._stopTime+=n)),!0))}clearTimelineState(){this._startTime=NaN,this._stopTime=1/0,this._state=r.waiting}destroy(){this._unload(),super.destroy(),this.unregisterCallback(),delete this._element,this._elementURL=void 0,this._state=r.waiting,this._currentTime=0,this._startTime=NaN,this._stopTime=1/0,this._ready=!1,this._loadCalled=!1,this._gl.deleteTexture(this._texture),this._texture=void 0}},o=class extends a{constructor(e,t,n,r,i=1,a=0,o=4,s=void 0,c={}){super(e,t,n,r),this._preloadTime=o,this._sourceOffset=a,this._globalPlaybackRate=i,this._mediaElementCache=s,this._playbackRate=1,this._playbackRateUpdated=!0,this._attributes=Object.assign({volume:1},c),this._loopElement=!1,this._isElementPlaying=!1,this._attributes.loop&&(this._loopElement=this._attributes.loop)}set playbackRate(e){this._playbackRate=e,this._playbackRateUpdated=!0}set stretchPaused(e){super.stretchPaused=e,this._element&&(this._stretchPaused?this._element.pause():this._state===r.playing&&this._element.play().catch(e=>{if(e.name!==`AbortError`)throw e}))}get stretchPaused(){return this._stretchPaused}get playbackRate(){return this._playbackRate}get elementURL(){return this._elementURL}get _buffering(){return this._element?this._element.readyState<HTMLMediaElement.HAVE_FUTURE_DATA:!1}set volume(e){this._attributes.volume=e,this._element!==void 0&&(this._element.volume=this._attributes.volume)}_triggerLoad(){if(this._isResponsibleForElementLifeCycle&&(this._mediaElementCache?this._element=this._mediaElementCache.getElementAndLinkToNode(this):(this._element=document.createElement(this._elementType),this._element.setAttribute(`crossorigin`,`anonymous`),this._element.setAttribute(`webkit-playsinline`,``),this._element.setAttribute(`playsinline`,``),this._playbackRateUpdated=!0),this._element.volume=this._attributes.volume,window.MediaStream!==void 0&&this._elementURL instanceof MediaStream?this._element.srcObject=this._elementURL:this._element.src=this._elementURL),this._element){for(let e in this._attributes)this._element[e]=this._attributes[e];let e=0;this._currentTime>this._startTime&&(e=this._currentTime-this._startTime),this._element.currentTime=this._sourceOffset+e,this._element.onerror=()=>{this._element!==void 0&&(console.debug(`Error with element`,this._element),this._state=r.error,this._ready=!0,this._triggerCallbacks(`error`))}}else this._state=r.error,this._ready=!0,this._triggerCallbacks(`error`);this._loadTriggered=!0}_load(){super._load(),this._loadTriggered||this._triggerLoad(),this._element!==void 0&&(this._element.readyState>3&&!this._element.seeking?(this._loopElement===!1&&(this._stopTime===1/0||this._stopTime==null)&&(this._stopTime=this._startTime+this._element.duration,this._triggerCallbacks(`durationchange`,this.duration)),this._ready!==!0&&(this._triggerCallbacks(`loaded`),this._playbackRateUpdated=!0),this._ready=!0):this._state!==r.error&&(this._ready=!1))}_unload(){if(super._unload(),this._isResponsibleForElementLifeCycle&&this._element!==void 0){this._element.removeAttribute(`src`),this._element.srcObject=void 0,this._element.load();for(let e in this._attributes)this._element.removeAttribute(e);this._mediaElementCache&&this._mediaElementCache.unlinkNodeFromElement(this._element),this._element=void 0,this._mediaElementCache||delete this._element}this._ready=!1,this._isElementPlaying=!1,this._loadTriggered=!1}_seek(e){if(super._seek(e),this.state===r.playing||this.state===r.paused){this._element===void 0&&this._load();let e=this._currentTime-this._startTime+this._sourceOffset;this._element.currentTime=e,this._ready=!1}(this._state===r.sequenced||this._state===r.ended)&&this._element!==void 0&&this._unload()}_update(e,t=!0){if(super._update(e,t),this._element!==void 0&&this._element.ended&&(this._state=r.ended,this._triggerCallbacks(`ended`)),this._startTime-this._currentTime<=this._preloadTime&&this._state!==r.waiting&&this._state!==r.ended&&this._load(),this._state===r.playing)return this._playbackRateUpdated&&=(this._element.playbackRate=this._globalPlaybackRate*this._playbackRate,!1),this._isElementPlaying||(this._isElementPlaying=!0,this._element.play().catch(e=>{if(e.name===`AbortError`)this._isElementPlaying=!1;else throw e}),this._stretchPaused&&this._element.pause()),!0;if(this._state===r.paused)return this._element.pause(),this._isElementPlaying=!1,!0;if(this._state===r.ended&&this._element!==void 0)return this._element.pause(),this._isElementPlaying&&this._unload(),!1}clearTimelineState(){super.clearTimelineState(),this._element!==void 0&&(this._element.pause(),this._isElementPlaying=!1),this._unload()}destroy(){this._element&&this._element.pause(),super.destroy()}},s=`VideoNode`,c=class extends o{constructor(){super(...arguments),this._displayName=s,this._elementType=`video`}},l=`CanvasNode`,u=class extends a{constructor(e,t,n,r,i=4){super(e,t,n,r),this._preloadTime=i,this._displayName=l}_load(){super._load(),this._ready=!0,this._triggerCallbacks(`loaded`)}_unload(){super._unload(),this._ready=!1}_seek(e){super._seek(e),(this.state===r.playing||this.state===r.paused)&&(this._element===void 0&&this._load(),this._ready=!1),(this._state===r.sequenced||this._state===r.ended)&&this._element!==void 0&&this._unload()}_update(e){if(super._update(e),this._startTime-this._currentTime<=this._preloadTime&&this._state!==r.waiting&&this._state!==r.ended&&this._load(),this._state===r.playing||this._state===r.paused)return!0;if(this._state===r.ended&&this._element!==void 0)return this._unload(),!1}},d=`CanvasNode`,f=class extends a{constructor(e,t,n,r,i=4,a={}){super(e,t,n,r),this._preloadTime=i,this._attributes=a,this._textureUploaded=!1,this._displayName=d}get elementURL(){return this._elementURL}_load(){if(this._image!==void 0){for(var e in this._attributes)this._image[e]=this._attributes[e];return}if(this._isResponsibleForElementLifeCycle){super._load(),this._image=new Image,this._image.setAttribute(`crossorigin`,`anonymous`),this._image.onload=()=>{this._ready=!0,window.createImageBitmap?window.createImageBitmap(this._image,{imageOrientation:`flipY`}).then(e=>{this._element=e,this._triggerCallbacks(`loaded`)}):(this._element=this._image,this._triggerCallbacks(`loaded`))},this._image.src=this._elementURL,this._image.onerror=()=>{console.error(`ImageNode failed to load. url:`,this._elementURL)};for(let e in this._attributes)this._image[e]=this._attributes[e]}this._image.onerror=()=>{console.debug(`Error with element`,this._image),this._state=r.error,this._ready=!0,this._triggerCallbacks(`error`)}}_unload(){super._unload(),this._isResponsibleForElementLifeCycle&&(this._image!==void 0&&(this._image.src=``,this._image.onerror=void 0,this._image=void 0,delete this._image),this._element instanceof window.ImageBitmap&&this._element.close()),this._ready=!1}_seek(e){super._seek(e),(this.state===r.playing||this.state===r.paused)&&this._image===void 0&&this._load(),(this._state===r.sequenced||this._state===r.ended)&&this._element!==void 0&&this._unload()}_update(e){if(this._textureUploaded?super._update(e,!1):super._update(e),this._startTime-this._currentTime<=this._preloadTime&&this._state!==r.waiting&&this._state!==r.ended&&this._load(),this._state===r.playing||this._state===r.paused)return!0;if(this._state===r.ended&&this._image!==void 0)return this._unload(),!1}};function p(e){this.message=e,this.name=`ConnectionException`}function m(e){this.message=e,this.name=`RenderException`}var h=`ProcessingNode`,g=class extends n{constructor(e,t,n,r,i){super(e,t,r,i),this._vertexShader=D(e,n.vertexShader,e.VERTEX_SHADER),this._fragmentShader=D(e,n.fragmentShader,e.FRAGMENT_SHADER),this._definition=n,this._properties={};for(let e in n.properties){let t=n.properties[e].value;Object.prototype.toString.call(t)===`[object Array]`&&(t=n.properties[e].value.slice());let r=n.properties[e].type;this._properties[e]={type:r,value:t}}this._shaderInputsTextureUnitMapping=[],this._maxTextureUnits=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),this._boundTextureUnits=0,this._texture=k(e),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.canvas.width,e.canvas.height,0,e.RGBA,e.UNSIGNED_BYTE,null),this._program=O(e,this._vertexShader,this._fragmentShader),this._framebuffer=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,this._framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this._texture,0),e.bindFramebuffer(e.FRAMEBUFFER,null);for(let e in this._properties)Object.defineProperty(this,e,{get:function(){return this._properties[e].value},set:function(t){this._properties[e].value=t}});for(let t in this._properties)if(this._properties[t].value instanceof Image&&(this._properties[t].texture=k(e),this._properties[t].textureUnit=e.TEXTURE0+this._boundTextureUnits,this._properties[t].textureUnitIndex=this._boundTextureUnits,this._boundTextureUnits+=1,this._boundTextureUnits>this._maxTextureUnits))throw new m(`Trying to bind more than available textures units to shader`);for(let t of n.inputs)if(this._shaderInputsTextureUnitMapping.push({name:t,textureUnit:e.TEXTURE0+this._boundTextureUnits,textureUnitIndex:this._boundTextureUnits,location:e.getUniformLocation(this._program,t)}),this._boundTextureUnits+=1,this._boundTextureUnits>this._maxTextureUnits)throw new m(`Trying to bind more than available textures units to shader`);for(let e in this._properties)this._properties[e].type===`uniform`&&(this._properties[e].location=this._gl.getUniformLocation(this._program,e));this._currentTimeLocation=this._gl.getUniformLocation(this._program,`currentTime`),this._currentTime=0;let a=e.getAttribLocation(this._program,`a_position`),o=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,o),e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),e.bufferData(e.ARRAY_BUFFER,new Float32Array([1,1,0,1,1,0,1,0,0,1,0,0]),e.STATIC_DRAW);let s=e.getAttribLocation(this._program,`a_texCoord`);e.enableVertexAttribArray(s),e.vertexAttribPointer(s,2,e.FLOAT,!1,0,0),this._displayName=h}setProperty(e,t){this._properties[e].value=t}getProperty(e){return this._properties[e].value}destroy(){super.destroy();for(let e in this._properties)this._properties[e].value instanceof Image&&(this._gl.deleteTexture(this._properties[e].texture),this._texture=void 0);this._gl.deleteTexture(this._texture),this._texture=void 0,this._gl.detachShader(this._program,this._vertexShader),this._gl.detachShader(this._program,this._fragmentShader),this._gl.deleteShader(this._vertexShader),this._gl.deleteShader(this._fragmentShader),this._gl.deleteProgram(this._program),this._gl.deleteFramebuffer(this._framebuffer)}_update(e){this._currentTime=e}_seek(e){this._currentTime=e}_render(){this._rendered=!0;let e=this._gl;e.viewport(0,0,e.canvas.width,e.canvas.height),e.useProgram(this._program),e.uniform1f(this._currentTimeLocation,parseFloat(this._currentTime));for(let t in this._properties){let n=this._properties[t].value,r=this._properties[t].type,i=this._properties[t].location;if(r===`uniform`){if(typeof n==`number`)e.uniform1f(i,n);else if(Object.prototype.toString.call(n)===`[object Array]`)n.length===1?e.uniform1fv(i,n):n.length===2?e.uniform2fv(i,n):n.length===3?e.uniform3fv(i,n):n.length===4?e.uniform4fv(i,n):console.debug(`Shader parameter`,t,`is too long an array:`,n);else if(n instanceof Image){let r=this._properties[t].texture,a=this._properties[t].textureUnit,o=this._properties[t].textureUnit;A(e,r,n),e.activeTexture(a),e.uniform1i(i,o),e.bindTexture(e.TEXTURE_2D,r)}}}}},_=`precision mediump float;
uniform sampler2D u_image;
varying vec2 v_texCoord;
varying float v_progress;
void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
}
`,v=`attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);
    v_texCoord = a_texCoord;
}
`,y=`DestinationNode`,b=class extends g{constructor(e,t){let n={fragmentShader:_,vertexShader:v,properties:{},inputs:[`u_image`]};super(e,t,n,n.inputs,!1),this._displayName=y}_render(){let e=this._gl;e.bindFramebuffer(e.FRAMEBUFFER,null),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.BLEND),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),this.inputs.forEach(t=>{super._render();var n=t._texture;for(let t of this._shaderInputsTextureUnitMapping)e.activeTexture(t.textureUnit),e.uniform1i(t.location,t.textureUnitIndex),e.bindTexture(e.TEXTURE_2D,n);e.drawArrays(e.TRIANGLES,0,6)})}},x=`EffectNode`,S=class extends g{constructor(e,t,n){let r=k(e);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),super(e,t,n,n.inputs,!0),this._placeholderTexture=r,this._displayName=x}_render(){let e=this._gl;e.bindFramebuffer(e.FRAMEBUFFER,this._framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this._texture,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.blendFunc(e.ONE,e.ZERO),super._render();let t=this._renderGraph.getInputsForNode(this);for(var n=0;n<this._shaderInputsTextureUnitMapping.length;n++){let r=this._placeholderTexture,i=this._shaderInputsTextureUnitMapping[n].textureUnit;n<t.length&&t[n]!==void 0&&(r=t[n]._texture),e.activeTexture(i),e.uniform1i(this._shaderInputsTextureUnitMapping[n].location,this._shaderInputsTextureUnitMapping[n].textureUnitIndex),e.bindTexture(e.TEXTURE_2D,r)}e.drawArrays(e.TRIANGLES,0,6),e.bindFramebuffer(e.FRAMEBUFFER,null)}},C=`TransitionNode`,w=class extends S{constructor(e,t,n){super(e,t,n),this._transitions={},this._initialPropertyValues={};for(let e in this._properties)this._initialPropertyValues[e]=this._properties[e].value;this._displayName=C}_doesTransitionFitOnTimeline(e){if(this._transitions[e.property]===void 0)return!0;for(let t of this._transitions[e.property])if(e.start>t.start&&e.start<t.end||e.end>t.start&&e.end<t.end||t.start>e.start&&t.start<e.end||t.end>e.start&&t.end<e.end)return!1;return!0}_insertTransitionInTimeline(e){this._transitions[e.property]===void 0&&(this._transitions[e.property]=[]),this._transitions[e.property].push(e),this._transitions[e.property].sort(function(e,t){return e.start-t.start})}transition(e,t,n,r,i=`mix`){let a={start:e+this._currentTime,end:t+this._currentTime,current:n,target:r,property:i};return this._doesTransitionFitOnTimeline(a)?(this._insertTransitionInTimeline(a),!0):!1}transitionAt(e,t,n,r,i=`mix`){let a={start:e,end:t,current:n,target:r,property:i};return this._doesTransitionFitOnTimeline(a)?(this._insertTransitionInTimeline(a),!0):!1}clearTransitions(e){e===void 0?this._transitions={}:this._transitions[e]=[]}clearTransition(e,t){let n;for(var r=0;r<this._transitions[e].length;r++){let i=this._transitions[e][r];t>i.start&&t<i.end&&(n=r)}return n===void 0?!1:(this._transitions[e].splice(n,1),!0)}_update(e){super._update(e);for(let n in this._transitions){let r=this[n];this._transitions[n].length>0&&(r=this._transitions[n][0].current);let i=!1;for(var t=0;t<this._transitions[n].length;t++){let a=this._transitions[n][t];if(e>a.end){r=a.target;continue}if(e>a.start&&e<a.end){let e=a.target-a.current,t=(this._currentTime-a.start)/(a.end-a.start);i=!0,this[n]=a.current+e*t;break}}i||(this[n]=r)}}},T=`CompositingNode`,E=class extends g{constructor(e,t,n){let r=k(e);e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),super(e,t,n,n.inputs,!1),this._placeholderTexture=r,this._displayName=T}_render(){let e=this._gl;e.bindFramebuffer(e.FRAMEBUFFER,this._framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this._texture,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA),this.inputs.forEach(t=>{if(t!==void 0){super._render();var n=t._texture;for(let t of this._shaderInputsTextureUnitMapping)e.activeTexture(t.textureUnit),e.uniform1i(t.location,t.textureUnitIndex),e.bindTexture(e.TEXTURE_2D,n);e.drawArrays(e.TRIANGLES,0,6)}}),e.bindFramebuffer(e.FRAMEBUFFER,null)}};function D(e,t,n){let r=e.createShader(n);if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw`could not compile shader:`+e.getShaderInfoLog(r);return r}function O(e,t,n){let r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw{error:4,msg:`Can't link shader program for track`,toString:function(){return this.msg}};return r}function k(e){let t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),t}function A(e,t,n){n.readyState!==void 0&&n.readyState===0||(e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,n),t._isTextureCleared=!1)}function j(e,t){t._isTextureCleared||=(e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([0,0,0,0])),!0)}function M(){let e=`adorable.alert.average.beautiful.blonde.bloody.blushing.bright.clean.clear.cloudy.colourful.concerned.crowded.curious.cute.dark.dirty.drab.distinct.dull.elegant.fancy.filthy.glamorous.gleaming.graceful.grotesque.homely.light.misty.motionless.muddy.plain.poised.quaint.scary.shiny.smoggy.sparkling.spotless.stormy.strange.ugly.unsightly.unusual`.split(`.`),t=`alive.brainy.broken.busy.careful.cautious.clever.crazy.damaged.dead.difficult.easy.fake.false.famous.forward.fragile.guilty.helpful.helpless.important.impossible.infamous.innocent.inquisitive.mad.modern.open.outgoing.outstanding.poor.powerful.puzzled.real.rich.right.robust.sane.scary.shy.sleepy.stupid.super.tame.thick.tired.wild.wrong`.split(`.`),n=[`manatee`,`gila monster`,`nematode`,`seahorse`,`slug`,`koala bear`,`giant tortoise`,`garden snail`,`starfish`,`sloth`,`american woodcock`,`coral`,`swallowtail butterfly`,`house sparrow`,`sea anemone`];function r(e){return e[Math.floor(Math.random()*e.length)]}function i(e){return e=e.replace(/\b\w/g,e=>e.toUpperCase()),e}let a=r(e)+` `+r(t)+` `+r(n);return a=i(a),a=a.replace(/ /g,`-`),a}function N(e){return console.warn(`VideoContext.exportToJSON has been deprecated. Please use VideoContext.snapshot instead.`),JSON.stringify(L(e))}function P(e){return{nodes:L(e),videoContext:F(e)}}function F(e){return{currentTime:e.currentTime,duration:e.duration,state:e.state,playbackRate:e.playbackRate}}var I=!1;function L(e){function t(e){var t=document.createElement(`a`);return t.href=e,t.href}function n(e,t){let n=[];for(let r of e.inputs){if(r===void 0)continue;let i,a=e.inputs.indexOf(r),o=t._processingNodes.indexOf(r);if(o>-1)i=`processor`+o;else{let e=t._sourceNodes.indexOf(r);e>-1?i=`source`+e:console.log(`Warning, can't find input`,r)}n.push({id:i,index:a})}return n}let i={},a=[];for(let e in r)a[r[e]]=e;for(let n in e._sourceNodes){let r=e._sourceNodes[n],o=`source`+n,s;r._isResponsibleForElementLifeCycle?s=t(r._elementURL):(I||=(console.debug(`Warning - Trying to export source created from an element not a URL. URL of export will be set to the elements src attribute and may be incorrect`,r),!0),s=r.element.src);let c={type:r.displayName,url:s,start:r.startTime,stop:r.stopTime,state:a[r.state]};c.type===`VideoNode`&&(c.currentTime=null,r.element&&r.element.currentTime&&(c.currentTime=r.element.currentTime)),r._sourceOffset&&(c.sourceOffset=r._sourceOffset),i[o]=c}for(let t in e._processingNodes){let r=e._processingNodes[t],a=`processor`+t,o={type:r.displayName,definition:r._definition,inputs:n(r,e),properties:{}};for(let e in o.definition.properties)o.properties[e]=r[e];o.type===`TransitionNode`&&(o.transitions=r._transitions),i[a]=o}return i.destination={type:`Destination`,inputs:n(e.destination,e)},i}function R(e,t){let n=document.createElement(`div`);if(t!==void 0){var r=document.createElement(`h2`);r.innerHTML=t,n.appendChild(r)}for(let t in e._properties){let r=document.createElement(`p`),a=document.createElement(`h3`);a.innerHTML=t,r.appendChild(a);let o=e._properties[t].value;if(typeof o==`number`){let n=document.createElement(`input`);n.setAttribute(`type`,`range`),n.setAttribute(`min`,`0`),n.setAttribute(`max`,`1`),n.setAttribute(`step`,`0.01`),n.setAttribute(`value`,o,toString());let i=document.createElement(`input`);i.setAttribute(`type`,`number`),i.setAttribute(`min`,`0`),i.setAttribute(`max`,`1`),i.setAttribute(`step`,`0.01`),i.setAttribute(`value`,o,toString());let a=!1;n.onmousedown=function(){a=!0},n.onmouseup=function(){a=!1},n.onmousemove=function(){a&&(e[t]=parseFloat(n.value),i.value=n.value)},n.onchange=function(){e[t]=parseFloat(n.value),i.value=n.value},i.onchange=function(){e[t]=parseFloat(i.value),n.value=i.value},r.appendChild(n),r.appendChild(i)}else if(Object.prototype.toString.call(o)===`[object Array]`)for(var i=0;i<o.length;i++){let n=document.createElement(`input`);n.setAttribute(`type`,`range`),n.setAttribute(`min`,`0`),n.setAttribute(`max`,`1`),n.setAttribute(`step`,`0.01`),n.setAttribute(`value`,o[i],toString());let a=document.createElement(`input`);a.setAttribute(`type`,`number`),a.setAttribute(`min`,`0`),a.setAttribute(`max`,`1`),a.setAttribute(`step`,`0.01`),a.setAttribute(`value`,o,toString());let s=i,c=!1;n.onmousedown=function(){c=!0},n.onmouseup=function(){c=!1},n.onmousemove=function(){c&&(e[t][s]=parseFloat(n.value),a.value=n.value)},n.onchange=function(){e[t][s]=parseFloat(n.value),a.value=n.value},a.onchange=function(){e[t][s]=parseFloat(a.value),n.value=a.value},r.appendChild(n),r.appendChild(a)}n.appendChild(r)}return n}function z(e){let t=e.destination,n=new Map;n.set(t,0);function r(e,t=0){for(let i of e.inputs){let e=t+1;n.has(i)?e>n.get(i)&&n.set(i,e):n.set(i,e),r(i,n.get(i))}}return r(t),n}function B(e,t){let n=t.getContext(`2d`),r=t.width,i=t.height;n.clearRect(0,0,r,i);let a=z(e),o=a.values();o=Array.from(o).sort(function(e,t){return t-e});let s=r/(o[0]+1),c=i/e._sourceNodes.length/3,l=c*1.618;function u(e,t,n,r){let i=t.get(e);t.values();let a=0;for(let n of t){if(n[0]===e)break;n[1]===i&&(a+=1)}return{x:n*t.get(e),y:r*1.5*a+50}}for(let t=0;t<e._renderGraph.connections.length;t++){let r=e._renderGraph.connections[t],i=u(r.source,a,s,c),o=u(r.destination,a,s,c);if(i!==void 0&&o!==void 0){n.beginPath();let e=i.x+l/2,t=i.y+c/2,r=o.x+l/2,a=o.y+c/2,s=r-e,u=a-t,d=Math.PI/2-Math.atan2(s,u),f=Math.sqrt((e-r)**2+(t-a)**2),p=Math.min(e,r)+(Math.max(e,r)-Math.min(e,r))/2,m=Math.min(t,a)+(Math.max(t,a)-Math.min(t,a))/2,h=Math.cos(d+Math.PI/2)*f/1.5+p,g=Math.sin(d+Math.PI/2)*f/1.5+m;n.arc(h,g,f/1.2,d-Math.PI+.95,d-.95),n.stroke()}}for(let e of a.keys()){let t=u(e,a,s,c),r=`#AA9639`,i=``;e.displayName===`CompositingNode`&&(r=`#000000`),e.displayName===`DestinationNode`&&(r=`#7D9F35`,i=`Output`),e.displayName===`VideoNode`&&(r=`#572A72`,i=`Video`),e.displayName===`CanvasNode`&&(r=`#572A72`,i=`Canvas`),e.displayName===`CanvasNode`&&(r=`#572A72`,i=`Image`),n.beginPath(),n.fillStyle=r,n.fillRect(t.x,t.y,l,c),n.fill(),n.fillStyle=`#000`,n.textAlign=`center`,n.font=`10px Arial`,n.fillText(i,t.x+l/2,t.y+c/2+2.5),n.fill()}}function V(e){function t(t){return e._sourceNodes.indexOf(t)===-1?`processor `+t.displayName+` `+e._processingNodes.indexOf(t):`source `+t.displayName+` `+e._sourceNodes.indexOf(t)}let n={nodes:[{id:t(e.destination),label:`Destination Node`,x:2.5,y:.5,size:2,node:e.destination}],edges:[]};for(let r=0;r<e._sourceNodes.length;r++){let i=e._sourceNodes[r],a=r*(1/e._sourceNodes.length);n.nodes.push({id:t(i),label:`Source `+r.toString(),x:0,y:a,size:2,color:`#572A72`,node:i})}for(let r=0;r<e._processingNodes.length;r++){let i=e._processingNodes[r];n.nodes.push({id:t(i),x:Math.random()*2.5,y:Math.random(),size:2,node:i})}for(let r=0;r<e._renderGraph.connections.length;r++){let i=e._renderGraph.connections[r];n.edges.push({id:`e`+r.toString(),source:t(i.source),target:t(i.destination)})}return n}function H(t,n){let r=t.compositor(e.COMBINE);for(let e of n){let n;if(e.type===`video`)n=t.video(e.src,e.sourceStart);else if(e.type===`image`)n=t.image(e.src,e.sourceStart);else{console.debug(`Clip type ${e.type} not recognised, skipping.`);continue}n.startAt(e.start),n.stopAt(e.start+e.duration),n.connect(r)}return r}function U(e,t,n){let r=t.getContext(`2d`),i=t.width,a=t.height,o=a/e._sourceNodes.length,s=e.duration;if(n>s&&!e.endOnLastSourceEnd&&(s=n),e.duration===1/0){let t=0;for(let n=0;n<e._sourceNodes.length;n++){let r=e._sourceNodes[n];r._stopTime!==1/0&&(t+=r._stopTime)}s=t>e.currentTime?t+5:e.currentTime+5}let c=i/s,l={video:[`#572A72`,`#3C1255`],image:[`#7D9F35`,`#577714`],canvas:[`#AA9639`,`#806D15`]};r.clearRect(0,0,i,a),r.fillStyle=`#999`;for(let t of e._processingNodes)if(t.displayName===`TransitionNode`)for(let e in t._transitions)for(let n of t._transitions[e]){let e=(n.end-n.start)*c,t=a,i=n.start*c;r.fillStyle=`rgba(0,0,0, 0.3)`,r.fillRect(i,0,e,t),r.fill()}for(let t=0;t<e._sourceNodes.length;t++){let n=e._sourceNodes[t],i=n._stopTime-n._startTime;i===1/0&&(i=e.currentTime);let a=n._startTime,s=i*c,u=o,d=a*c,f=o*t;r.fillStyle=l.video[t%l.video.length],r.fillRect(d,f,s,u),r.fill()}n!==void 0&&(r.fillStyle=`#000`,r.fillRect(n*c,0,1,a))}var W=class{constructor(){this._updateables=[],this._useWebworker=!1,this._active=!1,this._previousRAFTime=void 0,this._previousWorkerTime=void 0,this._webWorkerString=`            var running = false;            function tick(){                postMessage(Date.now());                if (running){                    setTimeout(tick, 1000/20);                }            }            self.addEventListener('message',function(msg){                var data = msg.data;                if (data === 'start'){                    running = true;                    tick();                }                if (data === 'stop') running = false;            });`,this._webWorker=void 0}_initWebWorker(){window.URL=window.URL||window.webkitURL;let e=new Blob([this._webWorkerString],{type:`application/javascript`});this._webWorker=new Worker(URL.createObjectURL(e)),this._webWorker.onmessage=e=>{let t=e.data;this._updateWorkerTime(t)}}_lostVisibility(){this._previousWorkerTime=Date.now(),this._useWebworker=!0,this._webWorker||this._initWebWorker(),this._webWorker.postMessage(`start`)}_gainedVisibility(){this._useWebworker=!1,this._previousRAFTime=void 0,this._webWorker&&this._webWorker.postMessage(`stop`),requestAnimationFrame(this._updateRAFTime.bind(this))}_init(){if(window.Worker){if(document.hidden===void 0){window.addEventListener(`focus`,this._gainedVisibility.bind(this)),window.addEventListener(`blur`,this._lostVisibility.bind(this));return}document.addEventListener(`visibilitychange`,()=>{document.hidden===!0?this._lostVisibility():this._gainedVisibility()},!1),requestAnimationFrame(this._updateRAFTime.bind(this))}}_updateWorkerTime(e){let t=(e-this._previousWorkerTime)/1e3;t!==0&&this._update(t),this._previousWorkerTime=e}_updateRAFTime(e){this._previousRAFTime===void 0&&(this._previousRAFTime=e);let t=(e-this._previousRAFTime)/1e3;t!==0&&this._update(t),this._previousRAFTime=e,this._useWebworker||requestAnimationFrame(this._updateRAFTime.bind(this))}_update(e){for(let t=0;t<this._updateables.length;t++)this._updateables[t]._update(parseFloat(e))}register(e){this._updateables.push(e),this._active===!1&&(this._active=!0,this._init())}unregister(e){let t=this._updateables.indexOf(e);t!==-1&&this._updateables.splice(t,1)}};function G({src:e,srcObject:t}){return!((e===``||e===void 0)&&t==null)}var K=`AudioNode`,q=class extends o{constructor(){super(...arguments),this._displayName=K,this._elementType=`audio`}_update(e){super._update(e,!1)}},J={AudioNode:q,CanvasNode:u,ImageNode:f,MediaNode:o,SourceNode:a,VideoNode:c},Y=class{constructor(){this.connections=[]}getOutputsForNode(e){let t=[];return this.connections.forEach(function(n){n.source===e&&t.push(n.destination)}),t}getNamedInputsForNode(e){let t=[];return this.connections.forEach(function(n){n.destination===e&&n.type===`name`&&t.push(n)}),t}getZIndexInputsForNode(e){let t=[];return this.connections.forEach(function(n){n.destination===e&&n.type===`zIndex`&&t.push(n)}),t.sort(function(e,t){return e.zIndex-t.zIndex}),t}getInputsForNode(e){let t=e.inputNames,n=[],r=this.getNamedInputsForNode(e),i=this.getZIndexInputsForNode(e);if(e._limitConnections===!0){for(let e=0;e<t.length;e++)n[e]=void 0;for(let e of r){let r=t.indexOf(e.name);n[r]=e.source}let e=0;for(let t=0;t<n.length;t++)n[t]===void 0&&i[e]!==void 0&&(n[t]=i[e].source,e+=1)}else{for(let e of r)n.push(e.source);for(let e of i)n.push(e.source)}return n}isInputAvailable(e,t){if(e._inputNames.indexOf(t)===-1)return!1;for(let n of this.connections)if(n.type===`name`&&n.destination===e&&n.name===t)return!1;return!0}registerConnection(e,t,n){if(t.inputs.length>=t.inputNames.length&&t._limitConnections===!0)throw new p(`Node has reached max number of inputs, can't connect`);if(t._limitConnections===!1&&this.getInputsForNode(t).includes(e)&&(console.debug(`WARNING - node connected mutliple times, removing previous connection`),this.unregisterConnection(e,t)),typeof n==`number`)this.connections.push({source:e,type:`zIndex`,zIndex:n,destination:t});else if(typeof n==`string`&&t._limitConnections)if(this.isInputAvailable(t,n))this.connections.push({source:e,type:`name`,name:n,destination:t});else throw new p(`Port `+n+` is already connected to`);else{let n=this.getZIndexInputsForNode(t),r=0;n.length>0&&(r=n[n.length-1].zIndex+1),this.connections.push({source:e,type:`zIndex`,zIndex:r,destination:t})}return!0}unregisterConnection(e,t){let n=[];return this.connections.forEach(function(r){r.source===e&&r.destination===t&&n.push(r)}),n.length===0?!1:(n.forEach(e=>{let t=this.connections.indexOf(e);this.connections.splice(t,1)}),!0)}static outputEdgesFor(e,t){let n=[];for(let r of t)r.source===e&&n.push(r);return n}static inputEdgesFor(e,t){let n=[];for(let r of t)r.destination===e&&n.push(r);return n}static getInputlessNodes(e){let t=[];for(let n of e)t.push(n.source);for(let n of e){let e=t.indexOf(n.destination);e!==-1&&t.splice(e,1)}return t}},X=class{constructor(e=null){this._element=this._createElement(),this._node=e}_createElement(){let e=document.createElement(`video`);return e.setAttribute(`crossorigin`,`anonymous`),e.setAttribute(`webkit-playsinline`,``),e.setAttribute(`playsinline`,``),e}get element(){return this._element}set element(e){this._element=e}linkNode(e){this._node=e}unlinkNode(){this._node=null}isPlaying(){return this._node&&this._node._state===r.playing}},Z=class{constructor(e=3){this._cacheItems=[],this._cacheItemsInitialised=!1;for(let t=0;t<e;t++)this._cacheItems.push(new X)}init(){if(!this._cacheItemsInitialised)for(let e of this._cacheItems)try{e.element.play().then(()=>{e.isPlaying()||e.element.pause()},e=>{if(e.name!==`NotSupportedError`&&e.name!==`AbortError`)throw e})}catch{}this._cacheItemsInitialised=!0}getElementAndLinkToNode(e){for(let t of this._cacheItems)if(!G(t.element))return t.linkNode(e),t.element;console.debug(`No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger.`);let t=new X(e);return this._cacheItems.push(t),this._cacheItemsInitialised=!1,t.element}unlinkNodeFromElement(e){for(let t of this._cacheItems)e===t._element&&t.unlinkNode()}get length(){return this._cacheItems.length}get unused(){let e=0;for(let t of this._cacheItems)G(t.element)||(e+=1);return e}},Q=new W,$=class t{constructor(e,n,{manualUpdate:r=!1,endOnLastSourceEnd:i=!0,useVideoElementCache:a=!0,videoElementCacheSize:o=6,webglContextAttributes:s={},stallTimeout:c=10,seekDebounce:l=50}={}){if(this._canvas=e,this._endOnLastSourceEnd=i,this._gl=e.getContext(`experimental-webgl`,Object.assign({preserveDrawingBuffer:!0},s,{alpha:!1})),this._gl===null){console.error(`Failed to intialise WebGL.`),n&&n();return}this._useVideoElementCache=a,this._useVideoElementCache&&(this._videoElementCache=new Z(o)),this._canvas.id&&(typeof this._canvas.id==`string`||this._canvas.id instanceof String)&&(this._id=e.id),this._id===void 0&&(this._id=M()),window.__VIDEOCONTEXT_REFS__===void 0&&(window.__VIDEOCONTEXT_REFS__={}),window.__VIDEOCONTEXT_REFS__[this._id]=this,this._renderGraph=new Y,this._sourceNodes=[],this._processingNodes=[],this._timeline=[],this._currentTime=0,this._state=t.STATE.PAUSED,this._playbackRate=1,this._volume=1,this._sourcesPlaying=void 0,this._destinationNode=new b(this._gl,this._renderGraph),this._stallStartTime=null,this._stallTimeout=c,this._seekDebounce=l,this._seekDebounceTimer=null,this._callbacks=new Map,Object.keys(t.EVENTS).forEach(e=>this._callbacks.set(t.EVENTS[e],[])),this._timelineCallbacks=[],r||Q.register(this)}get id(){return this._id}set id(e){delete window.__VIDEOCONTEXT_REFS__[this._id],window.__VIDEOCONTEXT_REFS__[e]!==void 0&&console.warn(`Warning; setting id to that of an existing VideoContext instance.`),window.__VIDEOCONTEXT_REFS__[e]=this,this._id=e}registerTimelineCallback(e,t,n=0){this._timelineCallbacks.push({time:e,func:t,ordering:n})}unregisterTimelineCallback(e){let t=[];for(let n of this._timelineCallbacks)n.func===e&&t.push(n);for(let e of t){let t=this._timelineCallbacks.indexOf(e);this._timelineCallbacks.splice(t,1)}}registerCallback(e,t){if(!this._callbacks.has(e))return!1;this._callbacks.get(e).push(t)}unregisterCallback(e){for(let t of this._callbacks.values()){let n=t.indexOf(e);if(n!==-1)return t.splice(n,1),!0}return!1}_callCallbacks(e){let t=this._callbacks.get(e);for(let e of t)e(this._currentTime)}get element(){return this._canvas}get state(){return this._state}set currentTime(e){(typeof e==`string`||e instanceof String)&&(e=parseFloat(e)),e<this.duration&&this._state===t.STATE.ENDED&&(this._state=t.STATE.PAUSED),this._currentTime=e,this._seekDebounce>0?(this._seekDebounceTimer!==null&&clearTimeout(this._seekDebounceTimer),this._seekDebounceTimer=setTimeout(()=>{this._seekDebounceTimer=null,this._flushSeek(this._currentTime)},this._seekDebounce)):this._flushSeek(e)}_flushSeek(e){for(let t=0;t<this._sourceNodes.length;t++)this._sourceNodes[t]._seek(e);for(let t=0;t<this._processingNodes.length;t++)this._processingNodes[t]._seek(e)}get currentTime(){return this._currentTime}get duration(){let e=0;for(let t=0;t<this._sourceNodes.length;t++)this._sourceNodes[t].state!==r.waiting&&this._sourceNodes[t]._stopTime>e&&(e=this._sourceNodes[t]._stopTime);return e}get destination(){return this._destinationNode}set playbackRate(e){if(e<=0)throw RangeError(`playbackRate must be greater than 0`);for(let t of this._sourceNodes)t.constructor.name===`VideoNode`&&(t._globalPlaybackRate=e,t._playbackRateUpdated=!0);this._playbackRate=e}get playbackRate(){return this._playbackRate}set volume(e){for(let t of this._sourceNodes)(t instanceof c||t instanceof q)&&(t.volume=e);this._volume=e}get volume(){return this._volume}play(){return console.debug(`VideoContext - playing`),this._videoElementCache&&this._videoElementCache.init(),this._state=t.STATE.PLAYING,!0}pause(){return console.debug(`VideoContext - pausing`),this._state=t.STATE.PAUSED,!0}video(e,t=0,n=4,r={}){let i=new c(e,this._gl,this._renderGraph,this._currentTime,this._playbackRate,t,n,this._videoElementCache,r);return this._sourceNodes.push(i),i}audio(e,t=0,n=4,r={}){let i=new q(e,this._gl,this._renderGraph,this._currentTime,this._playbackRate,t,n,this._audioElementCache,r);return this._sourceNodes.push(i),i}createVideoSourceNode(e,t=0,n=4,r={}){return this._deprecate(`Warning: createVideoSourceNode will be deprecated in v1.0, please switch to using VideoContext.video()`),this.video(e,t,n,r)}image(e,t=4,n={}){let r=new f(e,this._gl,this._renderGraph,this._currentTime,t,n);return this._sourceNodes.push(r),r}createImageSourceNode(e,t=0,n=4,r={}){return this._deprecate(`Warning: createImageSourceNode will be deprecated in v1.0, please switch to using VideoContext.image()`),this.image(e,t,n,r)}canvas(e){let t=new u(e,this._gl,this._renderGraph,this._currentTime);return this._sourceNodes.push(t),t}createCanvasSourceNode(e,t=0,n=4){return this._deprecate(`Warning: createCanvasSourceNode will be deprecated in v1.0, please switch to using VideoContext.canvas()`),this.canvas(e,t,n)}effect(e){let t=new S(this._gl,this._renderGraph,e);return this._processingNodes.push(t),t}createEffectNode(e){return this._deprecate(`Warning: createEffectNode will be deprecated in v1.0, please switch to using VideoContext.effect()`),this.effect(e)}compositor(e){let t=new E(this._gl,this._renderGraph,e);return this._processingNodes.push(t),t}customSourceNode(e,t,...n){let r=new e(t,this._gl,this._renderGraph,this._currentTime,...n);return this._sourceNodes.push(r),r}createCompositingNode(e){return this._deprecate(`Warning: createCompositingNode will be deprecated in v1.0, please switch to using VideoContext.compositor()`),this.compositor(e)}transition(e){let t=new w(this._gl,this._renderGraph,e);return this._processingNodes.push(t),t}createTransitionNode(e){return this._deprecate(`Warning: createTransitionNode will be deprecated in v1.0, please switch to using VideoContext.transition()`),this.transition(e)}_isSourceNodeActive(e,t=this._currentTime){let n=e.startTime,r=e.stopTime;return!isNaN(n)&&t>=n&&t<r}_isStalled(){for(let e=0;e<this._sourceNodes.length;e++){let t=this._sourceNodes[e];if(this._isSourceNodeActive(t)&&!t._isReady())return!0}return!1}update(e){this._update(e)}_update(e){if(this._sourceNodes=this._sourceNodes.filter(e=>{if(!e.destroyed)return e}),this._processingNodes=this._processingNodes.filter(e=>{if(!e.destroyed)return e}),this._state===t.STATE.PLAYING||this._state===t.STATE.STALLED||this._state===t.STATE.PAUSED){if(this._callCallbacks(t.EVENTS.UPDATE),this._state!==t.STATE.PAUSED)if(this._isStalled()){if(this._state!==t.STATE.STALLED)this._stallStartTime=Date.now(),this._callCallbacks(t.EVENTS.STALLED);else if(this._stallTimeout>0&&Date.now()-this._stallStartTime>this._stallTimeout*1e3){this._state=t.STATE.BROKEN;return}this._state=t.STATE.STALLED}else this._stallStartTime=null,this._state=t.STATE.PLAYING;if(this._state===t.STATE.PLAYING){let n=new Map;for(let t of this._timelineCallbacks)t.time>=this.currentTime&&t.time<this._currentTime+e*this._playbackRate&&(n.has(t.time)||n.set(t.time,[]),n.get(t.time).push(t));let r=Array.from(n.keys());r.sort(function(e,t){return e-t});for(let e of r){let t=n.get(e);t.sort(function(e,t){return e.ordering-t.ordering});for(let e of t)e.func()}if(this._currentTime+=e*this._playbackRate,this._currentTime>this.duration&&this._endOnLastSourceEnd){this._currentTime=this.duration;for(let e=0;e<this._sourceNodes.length;e++)this._sourceNodes[e]._pause(),this._sourceNodes[e]._update(this._currentTime);this._state=t.STATE.ENDED,this._callCallbacks(t.EVENTS.ENDED)}}let n=!1;for(let e=0;e<this._sourceNodes.length;e++){let i=this._sourceNodes[e];this._state===t.STATE.STALLED&&i._isReady()&&i._state===r.playing&&i._pause(),this._state===t.STATE.PAUSED&&i._pause(),this._state===t.STATE.PLAYING&&i._play(),i._update(this._currentTime),(i._state===r.paused||i._state===r.playing)&&(n=!0)}n!==this._sourcesPlaying&&this._state===t.STATE.PLAYING&&(n===!0?this._callCallbacks(t.EVENTS.CONTENT):this._callCallbacks(t.EVENTS.NOCONTENT),this._sourcesPlaying=n);let i=[],a=this._renderGraph.connections.slice(),o=Y.getInputlessNodes(a);for(;o.length>0;){let e=o.pop();i.push(e);for(let t of Y.outputEdgesFor(e,a)){let e=a.indexOf(t);e>-1&&a.splice(e,1),Y.inputEdgesFor(t.destination,a).length===0&&o.push(t.destination)}}for(let e of i)this._sourceNodes.indexOf(e)===-1&&(e._update(this._currentTime),e._render())}}reset(){for(let e of this._sourceNodes)e.destroy();for(let e of this._processingNodes)e.destroy();this._update(0),this._sourceNodes=[],this._processingNodes=[],this._timeline=[],this._currentTime=0,this._state=t.STATE.PAUSED,this._playbackRate=1,this._sourcesPlaying=void 0,this._stallStartTime=null,this._seekDebounceTimer!==null&&(clearTimeout(this._seekDebounceTimer),this._seekDebounceTimer=null),Object.keys(t.EVENTS).forEach(e=>this._callbacks.set(t.EVENTS[e],[])),this._timelineCallbacks=[]}destroy(){this.reset(),Q.unregister(this),window.__VIDEOCONTEXT_REFS__&&delete window.__VIDEOCONTEXT_REFS__[this._id]}_deprecate(e){console.log(e)}static get DEFINITIONS(){return e}static get NODES(){return J}snapshot(){return P(this)}};return $.STATE=Object.freeze({PLAYING:0,PAUSED:1,STALLED:2,ENDED:3,BROKEN:4}),$.EVENTS=Object.freeze({UPDATE:`update`,STALLED:`stalled`,ENDED:`ended`,CONTENT:`content`,NOCONTENT:`nocontent`}),$.visualiseVideoContextTimeline=U,$.visualiseVideoContextGraph=B,$.createControlFormForNode=R,$.createSigmaGraphDataFromRenderGraph=V,$.exportToJSON=N,$.updateablesManager=Q,$.importSimpleEDL=H,$});
//# sourceMappingURL=videocontext.js.map
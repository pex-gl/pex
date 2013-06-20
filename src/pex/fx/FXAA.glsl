#ifdef VERT

float FXAA_SUBPIX_SHIFT = 1.0/4.0;

uniform float rtWidth;
uniform float rtHeight;
attribute vec2 position;
attribute vec2 texCoord;
varying vec4 posPos;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);

  vec2 rcpFrame = vec2(1.0/rtWidth, 1.0/rtHeight);
  posPos.xy = texCoord.xy;
  posPos.zw = texCoord.xy - (rcpFrame * (0.5 + FXAA_SUBPIX_SHIFT));
}

#endif

#ifdef FRAG

#define FXAA_REDUCE_MIN   (1.0/ 128.0)
#define FXAA_REDUCE_MUL   (1.0 / 8.0)
#define FXAA_SPAN_MAX     8.0

uniform sampler2D tex0;
varying vec4 posPos;
uniform float rtWidth;
uniform float rtHeight;


vec4 applyFXAA(vec2 fragCoord, sampler2D tex)
{
    vec4 color;
    vec2 inverseVP = vec2(1.0 / rtWidth, 1.0 / rtHeight);
    vec3 rgbNW = texture2D(tex, (fragCoord + vec2(-1.0, -1.0)) * inverseVP).xyz;
    vec3 rgbNE = texture2D(tex, (fragCoord + vec2(1.0, -1.0)) * inverseVP).xyz;
    vec3 rgbSW = texture2D(tex, (fragCoord + vec2(-1.0, 1.0)) * inverseVP).xyz;
    vec3 rgbSE = texture2D(tex, (fragCoord + vec2(1.0, 1.0)) * inverseVP).xyz;
    vec3 rgbM  = texture2D(tex, fragCoord  * inverseVP).xyz;
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

    //return texture2D(tex, fragCoord);
    //return vec4(fragCoord, 0.0, 1.0);
    //return vec4(rgbM, 1.0);

    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

    float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                          (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

    float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
              max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
              dir * rcpDirMin)) * inverseVP;

    vec3 rgbA = 0.5 * (
        texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
        texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

    float lumaB = dot(rgbB, luma);
    if ((lumaB < lumaMin) || (lumaB > lumaMax))
        color = vec4(rgbA, 1.0);
    else
        color = vec4(rgbB, 1.0);
    return color;
}

void main() {
  gl_FragColor = applyFXAA(posPos.xy * vec2(rtWidth, rtHeight), tex0);
}

//#version 120
/*
uniform sampler2D tex0;
varying vec4 posPos;
uniform float rtWidth;
uniform float rtHeight;
float FXAA_SPAN_MAX = 8.0;
float FXAA_REDUCE_MUL = 1.0/8.0;

#define FxaaInt2 ivec2
#define FxaaFloat2 vec2
#define FxaaTexLod0(t, p) texture2DLod(t, p, 0.0)
#define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)

vec3 FxaaPixelShader(
  vec4 posPos, // Output of FxaaVertexShader interpolated across screen.
  sampler2D tex, // Input texture.
  vec2 rcpFrame) // Constant {1.0/frameWidth, 1.0/frameHeight}.
{
//---------------------------------------------------------
    #define FXAA_REDUCE_MIN   (1.0/128.0)
    //#define FXAA_REDUCE_MUL   (1.0/8.0)
    //#define FXAA_SPAN_MAX     8.0
//---------------------------------------------------------
    vec3 rgbNW = FxaaTexLod0(tex, posPos.zw).xyz;
    vec3 rgbNE = FxaaTexOff(tex, posPos.zw, FxaaInt2(1,0), rcpFrame.xy).xyz;
    vec3 rgbSW = FxaaTexOff(tex, posPos.zw, FxaaInt2(0,1), rcpFrame.xy).xyz;
    vec3 rgbSE = FxaaTexOff(tex, posPos.zw, FxaaInt2(1,1), rcpFrame.xy).xyz;
    vec3 rgbM  = FxaaTexLod0(tex, posPos.xy).xyz;
//---------------------------------------------------------
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float lumaNW = dot(rgbNW, luma);
    float lumaNE = dot(rgbNE, luma);
    float lumaSW = dot(rgbSW, luma);
    float lumaSE = dot(rgbSE, luma);
    float lumaM  = dot(rgbM,  luma);
/*---------------------------------------------------------
    float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
    float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
/*---------------------------------------------------------
    vec2 dir;
    dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
    dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));
/*---------------------------------------------------------
    float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
        FXAA_REDUCE_MIN);
    float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);
    dir = min(FxaaFloat2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),
          max(FxaaFloat2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
          dir * rcpDirMin)) * rcpFrame.xy;
/*--------------------------------------------------------
    vec3 rgbA = (1.0/2.0) * (
        FxaaTexLod0(tex, posPos.xy + dir * (1.0/3.0 - 0.5)).xyz +
        FxaaTexLod0(tex, posPos.xy + dir * (2.0/3.0 - 0.5)).xyz);
    vec3 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (
        FxaaTexLod0(tex, posPos.xy + dir * (0.0/3.0 - 0.5)).xyz +
        FxaaTexLod0(tex, posPos.xy + dir * (3.0/3.0 - 0.5)).xyz);
    float lumaB = dot(rgbB, luma);
    if((lumaB < lumaMin) || (lumaB > lumaMax)) return rgbA;
    return rgbB; }

vec4 PostFX(sampler2D tex, vec2 uv, float time)
{
  vec4 c = vec4(0.0);
  vec2 rcpFrame = vec2(1.0/rt_w, 1.0/rt_h);
  c.rgb = FxaaPixelShader(posPos, tex, rcpFrame);
  //c.rgb = 1.0 - texture2D(tex, posPos.xy).rgb;
  c.a = 1.0;
  return c;
}

void main()
{
  vec2 uv = posPos.xy;
  gl_FragColor = PostFX(tex0, uv, 0.0);
}

*/

#endif
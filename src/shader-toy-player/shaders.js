export default {
  star: `// Star Nest by Pablo Roman Andrioli


#define iterations 17
#define formuparam 0.53

#define volsteps 20
#define stepsize 0.1

#define zoom   0.800
#define tile   0.850
#define speed  0.010 

#define brightness 0.0015
#define darkmatter 0.300
#define distfading 0.730
#define saturation 0.850


void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	//get coords and direction
	vec2 uv=fragCoord.xy/iResolution.xy-.5;
	uv.y*=iResolution.y/iResolution.x;
	vec3 dir=vec3(uv*zoom,1.);
	float time=iTime*speed+.25;

	//mouse rotation
	float a1=.5+iMouse.x/iResolution.x*2.;
	float a2=.8+iMouse.y/iResolution.y*2.;
	mat2 rot1=mat2(cos(a1),sin(a1),-sin(a1),cos(a1));
	mat2 rot2=mat2(cos(a2),sin(a2),-sin(a2),cos(a2));
	dir.xz*=rot1;
	dir.xy*=rot2;
	vec3 from=vec3(1.,.5,0.5);
	from+=vec3(time*2.,time,-2.);
	from.xz*=rot1;
	from.xy*=rot2;
	
	//volumetric rendering
	float s=0.1,fade=1.;
	vec3 v=vec3(0.);
	for (int r=0; r<volsteps; r++) {
		vec3 p=from+s*dir*.5;
		p = abs(vec3(tile)-mod(p,vec3(tile*2.))); // tiling fold
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) { 
			p=abs(p)/dot(p,p)-formuparam; // the magic formula
			a+=abs(length(p)-pa); // absolute sum of average change
			pa=length(p);
		}
		float dm=max(0.,darkmatter-a*a*.001); //dark matter
		a*=a*a; // add contrast
		if (r>6) fade*=1.-dm; // dark matter, don't render near
		//v+=vec3(dm,dm*.5,0.);
		v+=fade;
		v+=vec3(s,s*s,s*s*s*s)*a*brightness*fade; // coloring based on distance
		fade*=distfading; // distance fading
		s+=stepsize;
	}
	v=mix(vec3(length(v)),v,saturation); //color adjust
	fragColor = vec4(v*.01,1.);	
	
}`,
  sea: `/*
 * "Seascape" by Alexander Alekseev aka TDM - 2014
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * Contact: tdmaav@gmail.com
 */

const int NUM_STEPS = 8;
const float PI	 	= 3.141592;
const float EPSILON	= 1e-3;
#define EPSILON_NRM (0.1 / iResolution.x)
#define AA

// sea
const int ITER_GEOMETRY = 3;
const int ITER_FRAGMENT = 5;
const float SEA_HEIGHT = 0.6;
const float SEA_CHOPPY = 4.0;
const float SEA_SPEED = 0.8;
const float SEA_FREQ = 0.16;
const vec3 SEA_BASE = vec3(0.0,0.09,0.18);
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6)*0.6;
#define SEA_TIME (1.0 + iTime * SEA_SPEED)
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

// math
mat3 fromEuler(vec3 ang) {
	vec2 a1 = vec2(sin(ang.x),cos(ang.x));
    vec2 a2 = vec2(sin(ang.y),cos(ang.y));
    vec2 a3 = vec2(sin(ang.z),cos(ang.z));
    mat3 m;
    m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
	m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
	m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
	return m;
}
float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));	
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );	
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ), 
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ), 
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p) {
    return pow(dot(n,l) * 0.4 + 0.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s) {    
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
}

// sky
vec3 getSkyColor(vec3 e) {
    e.y = (max(e.y,0.0)*0.8+0.2)*0.8;
    return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4) * 1.1;
}

// sea
float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);        
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));    
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;
    
    float d, h = 0.0;    
    for(int i = 0; i < ITER_GEOMETRY; i++) {        
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

float map_detailed(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;
    
    float d, h = 0.0;    
    for(int i = 0; i < ITER_FRAGMENT; i++) {        
    	d = sea_octave((uv+SEA_TIME)*freq,choppy);
    	d += sea_octave((uv-SEA_TIME)*freq,choppy);
        h += d * amp;        
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {  
    float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
    fresnel = pow(fresnel,3.0) * 0.5;
        
    vec3 reflected = getSkyColor(reflect(eye,n));    
    vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12; 
    
    vec3 color = mix(refracted,reflected,fresnel);
    
    float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
    color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;
    
    color += vec3(specular(n,l,eye,60.0));
    
    return color;
}

// tracing
vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = map_detailed(p);    
    n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
    n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
    n.y = eps;
    return normalize(n);
}

float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {  
    float tm = 0.0;
    float tx = 1000.0;    
    float hx = map(ori + dir * tx);
    if(hx > 0.0) {
        p = ori + dir * tx;
        return tx;   
    }
    float hm = map(ori + dir * tm);    
    float tmid = 0.0;
    for(int i = 0; i < NUM_STEPS; i++) {
        tmid = mix(tm,tx, hm/(hm-hx));                   
        p = ori + dir * tmid;                   
    	float hmid = map(p);
		if(hmid < 0.0) {
        	tx = tmid;
            hx = hmid;
        } else {
            tm = tmid;
            hm = hmid;
        }
    }
    return tmid;
}

vec3 getPixel(in vec2 coord, float time) {    
    vec2 uv = coord / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;    
        
    // ray
    vec3 ang = vec3(sin(time*3.0)*0.1,sin(time)*0.2+0.3,time);    
    vec3 ori = vec3(0.0,3.5,time*5.0);
    vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.14;
    dir = normalize(dir) * fromEuler(ang);
    
    // tracing
    vec3 p;
    heightMapTracing(ori,dir,p);
    vec3 dist = p - ori;
    vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
    vec3 light = normalize(vec3(0.0,1.0,0.8)); 
             
    // color
    return mix(
        getSkyColor(dir),
        getSeaColor(p,n,light,dir,dist),
    	pow(smoothstep(0.0,-0.02,dir.y),0.2));
}

// main
void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float time = iTime * 0.3 + iMouse.x*0.01;
	
#ifdef AA
    vec3 color = vec3(0.0);
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
        	vec2 uv = fragCoord+vec2(i,j)/3.0;
    		color += getPixel(uv, time);
        }
    }
    color /= 9.0;
#else
    vec3 color = getPixel(fragCoord, time);
#endif
    
    // post
	fragColor = vec4(pow(color,vec3(0.65)), 1.0);
}
`,
  cloud: `// Protean clouds by nimitz (twitter: @stormoid)
// https://www.shadertoy.com/view/3l23Rh
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
// Contact the author for other licensing options

/*
	Technical details:

	The main volume noise is generated from a deformed periodic grid, which can produce
	a large range of noise-like patterns at very cheap evalutation cost. Allowing for multiple
	fetches of volume gradient computation for improved lighting.

	To further accelerate marching, since the volume is smooth, more than half the the density
	information isn't used to rendering or shading but only as an underlying volume	distance to 
	determine dynamic step size, by carefully selecting an equation	(polynomial for speed) to 
	step as a function of overall density (not necessarily rendered) the visual results can be 
	the	same as a naive implementation with ~40% increase in rendering performance.

	Since the dynamic marching step size is even less uniform due to steps not being rendered at all
	the fog is evaluated as the difference of the fog integral at each rendered step.

*/

mat2 rot(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}
const mat3 m3 = mat3(0.33338, 0.56034, -0.71817, -0.87887, 0.32651, -0.15323, 0.15162, 0.69596, 0.61339)*1.93;
float mag2(vec2 p){return dot(p,p);}
float linstep(in float mn, in float mx, in float x){ return clamp((x - mn)/(mx - mn), 0., 1.); }
float prm1 = 0.;
vec2 bsMo = vec2(0);

vec2 disp(float t){ return vec2(sin(t*0.22)*1., cos(t*0.175)*1.)*2.; }

vec2 map(vec3 p)
{
    vec3 p2 = p;
    p2.xy -= disp(p.z).xy;
    p.xy *= rot(sin(p.z+iTime)*(0.1 + prm1*0.05) + iTime*0.09);
    float cl = mag2(p2.xy);
    float d = 0.;
    p *= .61;
    float z = 1.;
    float trk = 1.;
    float dspAmp = 0.1 + prm1*0.2;
    for(int i = 0; i < 5; i++)
    {
		p += sin(p.zxy*0.75*trk + iTime*trk*.8)*dspAmp;
        d -= abs(dot(cos(p), sin(p.yzx))*z);
        z *= 0.57;
        trk *= 1.4;
        p = p*m3;
    }
    d = abs(d + prm1*3.)+ prm1*.3 - 2.5 + bsMo.y;
    return vec2(d + cl*.2 + 0.25, cl);
}

vec4 render( in vec3 ro, in vec3 rd, float time )
{
	vec4 rez = vec4(0);
    const float ldst = 8.;
	vec3 lpos = vec3(disp(time + ldst)*0.5, time + ldst);
	float t = 1.5;
	float fogT = 0.;
	for(int i=0; i<130; i++)
	{
		if(rez.a > 0.99)break;

		vec3 pos = ro + t*rd;
        vec2 mpv = map(pos);
		float den = clamp(mpv.x-0.3,0.,1.)*1.12;
		float dn = clamp((mpv.x + 2.),0.,3.);
        
		vec4 col = vec4(0);
        if (mpv.x > 0.6)
        {
        
            col = vec4(sin(vec3(5.,0.4,0.2) + mpv.y*0.1 +sin(pos.z*0.4)*0.5 + 1.8)*0.5 + 0.5,0.08);
            col *= den*den*den;
			col.rgb *= linstep(4.,-2.5, mpv.x)*2.3;
            float dif =  clamp((den - map(pos+.8).x)/9., 0.001, 1. );
            dif += clamp((den - map(pos+.35).x)/2.5, 0.001, 1. );
            col.xyz *= den*(vec3(0.005,.045,.075) + 1.5*vec3(0.033,0.07,0.03)*dif);
        }
		
		float fogC = exp(t*0.2 - 2.2);
		col.rgba += vec4(0.06,0.11,0.11, 0.1)*clamp(fogC-fogT, 0., 1.);
		fogT = fogC;
		rez = rez + col*(1. - rez.a);
		t += clamp(0.5 - dn*dn*.05, 0.09, 0.3);
	}
	return clamp(rez, 0.0, 1.0);
}

float getsat(vec3 c)
{
    float mi = min(min(c.x, c.y), c.z);
    float ma = max(max(c.x, c.y), c.z);
    return (ma - mi)/(ma+ 1e-7);
}

//from my "Will it blend" shader (https://www.shadertoy.com/view/lsdGzN)
vec3 iLerp(in vec3 a, in vec3 b, in float x)
{
    vec3 ic = mix(a, b, x) + vec3(1e-6,0.,0.);
    float sd = abs(getsat(ic) - mix(getsat(a), getsat(b), x));
    vec3 dir = normalize(vec3(2.*ic.x - ic.y - ic.z, 2.*ic.y - ic.x - ic.z, 2.*ic.z - ic.y - ic.x));
    float lgt = dot(vec3(1.0), ic);
    float ff = dot(dir, normalize(ic));
    ic += 1.5*dir*sd*ff*lgt;
    return clamp(ic,0.,1.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{	
	vec2 q = fragCoord.xy/iResolution.xy;
    vec2 p = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
    bsMo = (iMouse.xy - 0.5*iResolution.xy)/iResolution.y;
    
    float time = iTime*3.;
    vec3 ro = vec3(0,0,time);
    
    ro += vec3(sin(iTime)*0.5,sin(iTime*1.)*0.,0);
        
    float dspAmp = .85;
    ro.xy += disp(ro.z)*dspAmp;
    float tgtDst = 3.5;
    
    vec3 target = normalize(ro - vec3(disp(time + tgtDst)*dspAmp, time + tgtDst));
    ro.x -= bsMo.x*2.;
    vec3 rightdir = normalize(cross(target, vec3(0,1,0)));
    vec3 updir = normalize(cross(rightdir, target));
    rightdir = normalize(cross(updir, target));
	vec3 rd=normalize((p.x*rightdir + p.y*updir)*1. - target);
    rd.xy *= rot(-disp(time + 3.5).x*0.2 + bsMo.x);
    prm1 = smoothstep(-0.4, 0.4,sin(iTime*0.3));
	vec4 scn = render(ro, rd, time);
		
    vec3 col = scn.rgb;
    col = iLerp(col.bgr, col.rgb, clamp(1.-prm1,0.05,1.));
    
    col = pow(col, vec3(.55,0.65,0.6))*vec3(1.,.97,.9);

    col *= pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.12)*0.7+0.3; //Vign
    
	fragColor = vec4( col, 1.0 );
}
`,
}

export const cube = {
  image: `precision highp float;

float grow(vec3 p) {
    float f = fract(iTime * (22.5 / 60.0) - (length(p) - 10.0) * 0.01);
    f = smoothstep(0.0, 0.02, f) * smoothstep(0.1, 0.02, f);
    float f2 = fract(iTime * 1.5);
    f2 = smoothstep(0.5, 0.0, f2) * smoothstep(0.0, 0.1, f2);
    f += f2 * 0.2;
    return -f * 1.5;
}

float cube(vec3 p, vec3 s) {
    return length(p - clamp(p, -s, s));
}

float square_(vec2 p) {
    return length(p - clamp(p, vec2(-1.0), vec2(1.0)));
}

float square(vec2 p) {
    return square_(p / 2.0) * 2.0;
}

float sphere(vec3 p) {
    return length(p) - 1.0;
}

float path(vec3 p) {
    return -max((sphere(p / 9.0) * 9.0), -sphere(p / 6.0) * 6.0);
}

float rand(vec3 co) {
    float mid = dot(co, vec3(12.9898, 78.233, 45.96483));
    mid = mod(mid, 3.14);
    return fract(sin(mid) * 43758.5453);
}

float noise(float t) {
    return sin(t * 3.4) + sin(t * 1.2 + 0.5);
}

float onoise(float t) {
    return noise(t) + noise(t * 2.0) * 0.5 + noise(t * 4.0) * 0.25 + noise(t * 8.0) * 0.125;
}

void r(inout vec2 v, float r) {
    vec2 o = v;
    float s = sin(r);
    float c = cos(r);
    v.x = o.x * s - o.y * c;
    v.y = o.x * c + o.y * s;
}

float cubegrid(vec3 p) {
    vec3 rep = floor((p + 2.0) / 4.0);
    
    vec3 s = rand(rep) * vec3(1.5, 1.5, 3.5);
    vec3 o = vec3(rand(rep), rand(rep + vec3(1.0, 6.0, 0.0)), rand(rep + vec3(0.2, 0.9, 12.0)));
    o = o * 2.0 - 1.0;
    
    return cube(p - rep * vec3(4.0) + o, s);
}

vec3 cam(float t) {
    return vec3(onoise(t * 0.5), onoise(t * 0.5 + 10.0), onoise(t * 0.5 + 20.0)) * 40.0;
}
vec3 cam2(float t) {
    return vec3(noise(t * 0.5 + 19.4), noise(t * 0.5 + 420.0), noise(t * 0.5 + 4343.0));
}

float grid2(vec3 p) {
    float s = 10.0;
    p = mod(p + s, s * 2.0) - s;

    return min(square(p.xy), min(square(p.xz), square(p.yz)));
}

float d(vec3 p, vec3 c) {
    vec3 ip = p;
                
    float r = min(cubegrid(p * 2.0), cubegrid((p * 2.0) + vec3(202.0, 2.0, 2.0)));
    
    float g2 = grid2(p);
    r = max(g2 - 1.5, r);
    //r = min(r, g2);
    
    r += grow(c);
    
    return max(r, -(sphere(c / 3.0) * 3.0));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    vec2 uv = fragCoord/iResolution.xy;
    uv = (uv * 2.0 - 1.0);
    uv.x *= (iResolution.x / iResolution.y);

    vec3 col = vec3(0.0);
    vec3 pos = vec3(0.0, 0.0, 0.0);
    vec3 dir = normalize(vec3(-1.0, uv * 0.5));
    
    vec3 c = cam(iTime * 0.04);
    pos = -c;
    vec3 fwd = normalize(c - cam((iTime * 0.04) - 0.001));
    vec3 right = normalize(cross(fwd, cam2(iTime * 0.02)));
    vec3 up = cross(fwd, right);
    dir = mat3(
        fwd,
        right,
        up
    ) * dir;


    int i;
    float i_f = 0.0;
    
    for (i = 0; i < 256; i++) {
        float x = d(pos, pos + c) * 0.5;
        if (x < 0.0001) {
            i_f = 1.0 - clamp(x / 0.0001, 0.0, 1.0);
            break;
        }
        if (x > 1000.0) {
            i_f = (x - 1000.0) / 1000.0;
            break;
        }
        pos += dir * x;
    }
        
    float f2 = fract(iTime * 1.5 - length(pos + c) * 0.003);
    f2 = smoothstep(0.5, 0.0, f2) * smoothstep(0.0, 0.1, f2);

col = 1.0 - pow(vec3((float(256 - i) + i_f) / 256.0), (normalize(pos) + 1.1) * 3.0);
    col *= (1.0 + f2 * 2.0);

    // Output to screen
    fragColor = vec4(col,1.0);
}`,
  sound: `precision highp float;

float rand(vec2 co) {
    float mid = dot(co, vec2(12.9898, 78.233));
    mid = mod(mid, 3.14);
    return fract(sin(mid) * 43758.5453);
}

float kick(float t) {
    return smoothstep(0.25, 0.0, t);
}

float cymbal(float t) {
    return smoothstep(0.0, 0.005, t) * smoothstep(0.13, 0.02, t);
}

vec2 mainSound( int samp, float time )
{
    float bps = 90.0 / 60.0;
    float nps = bps * 4.0;
    
    float b_id = floor(mod(time * nps, 19.0));
    
    float bfract = fract(time * bps * 0.25);
    
    float bartime = fract(time * bps);
    float ktime = bartime;
    float camp = cymbal(bartime - 0.5) * 0.6;
    if (bfract > 0.75) {
        camp += smoothstep(0.5, 1.0, bartime) * 0.3;
    }
    
    if (bfract > 0.86) {
        ktime = fract(ktime * 4.0) / 4.0;
    }
    
    //camp += cymbal(fract(time * nps) * 2.0) * 0.2;
    
    float bfreq = floor(rand(vec2(b_id, 8.0)) * 6.0) * 3.0 + 140.0;
    float bhold = rand(vec2(b_id, 0.0)) * 0.4 + 0.6;
    float bslide = 0.0;
    if (rand(vec2(b_id, 4.0)) > 0.2) {
        bslide = (rand(vec2(b_id, 12.0)) * 2.0 - 1.0) * 10.0;
    }
    float ntime = fract(time * nps);
    float bamp = smoothstep(bhold, 0.0, ntime) * smoothstep(0.0, 0.05, ntime);
    bamp += 2.0 * smoothstep(0.04, 0.0, ntime);
    float bass = tanh(sin(6.2831*(bfreq*time+bslide*ntime*ntime))*12.0) * sin(6.2831*100.0*time) * 0.1 * bamp;
    float kick = sin(6.2831*(4.0*log(ktime*20.0 + 0.5)))*kick(ktime);
    float cym = camp * rand(vec2(ktime * 200.0));
    float hf = 600.0;
    float hum = sin(time * 6.2831 * hf * 3.0) + sin(time * 6.2831 * hf * 4.0) * 0.6 + sin(time * 6.2831 * hf * 5.0) * 0.3 + sin(time * 6.2831 * hf * 6.0) * 0.15 + sin(time * 6.2831 * hf * 7.0) * 0.06;
    hum *= smoothstep(0.02, 0.0, fract(time * bps * 0.5));
    return vec2(clamp(bass+kick+cym + hum * 0.1, -1.0, 1.0));
}vec2 mainSound( in int samp, float time )
{
	vec2 y = vec2( 0.0 );
	
    float d = 1.0;
    for( int j=0; j<4; j++ )
    {

        float base = 512.0 + 512.0*sin( time * 0.25 );

        for(int i=0; i<256; i++ )
        {
            float h = float(i)/256.0;

            vec2 ti = texture( iChannel0, vec2(h,time*0.1)).xy;

            float a = ti.x*ti.x/(0.1+h*h);

            y += d * a * cos( vec2(3.0*h,0.0) + 6.2831*time*base*h + ti.y*100.0 );
        }
        time += 0.15;
        d *= 0.9;
    }    

    y /= 256.0;
    y /= 2.0;
    
    y = sin(1.57*y);
    
    return y;
}`,
}

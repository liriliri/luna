import 'luna-shader-toy-player.css'
import ShaderToyPlayer from 'luna-shader-toy-player.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'shader-toy-player',
  (container) => {
    const shaderToyPlayer = new ShaderToyPlayer(container)
    shaderToyPlayer.load([
      {
        inputs: [],
        outputs: [
          {
            id: '4dfGRr',
            channel: 0,
          },
        ],
        code:
          '#define STEPS 250.0\n#define MDIST 100.0\n#define pi 3.1415926535\n#define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))\n#define sat(a) clamp(a,0.0,1.0)\n\n//Comment to remove triangle wobble\n#define WOBBLE \n\n//ADJUST AA HERE\n#define AA 1.0\n\n//Camera Control\n//#define CAM\n\n//based on ideas from \n//https://www.shadertoy.com/view/fsVSzw\n//https://www.shadertoy.com/view/MscSDB\n//https://www.shadertoy.com/view/3ddGzn\n#define h13(n) fract((n)*vec3(12.9898,78.233,45.6114)*43758.5453123)\nvec2 vor(vec2 v, vec3 p, vec3 s){\n    p = abs(fract(p-s)-0.5);\n    float a = max(p.x,max(p.y,p.z));\n    float b = min(v.x,a);\n    float c = max(v.x,min(v.y,a));\n    return vec2(b,c);\n}\n\nfloat vorMap(vec3 p){\n    vec2 v = vec2(5.0);\n    v = vor(v,p,h13(0.96));\n    p.xy*=rot(1.2);\n    v = vor(v,p,h13(0.55));\n    p.yz*=rot(2.);\n    v = vor(v,p,h13(0.718));\n    p.zx*=rot(2.7);\n    v = vor(v,p,h13(0.3));\n    return v.y-v.x; \n}\n\n//box sdf\nfloat box(vec3 p, vec3 b){\n  vec3 q = abs(p)-b;\n  return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);\n}\n\n\nfloat va = 0.; //voronoi animations\nfloat sa = 0.; //size change animation\nfloat rlg; //global ray length\nbool hitonce = false; //for tracking complications with the voronoi \n\n\n//I put quite a lot of effort into making the normals inside the voronoi correct but \n//in the end the normals are only partially correct and I barely used them, however\n//the code is still messy from my failed attempt :)\nvec2 map(vec3 p, vec3 n){\n    vec2 a = vec2(1);\n    vec2 b = vec2(2);\n    vec3 po = p;\n    vec3 no = n;\n    p-=n;\n    float len = 9.5;\n    len+=sa;\n    float len2 = len-1.0;\n    p.x-=(len/2.0);\n    a.x = box(p,vec3(1,1,len));\n    a.x = min(a.x,box(p-vec3(0,len2,len2),vec3(1,len,1)));\n    a.x = min(a.x,box(p-vec3(-len2,0,-len2),vec3(len,1,1)));\n    float tip = box(p-vec3(len2,len2*2.0,len2),vec3(len2,1,1));   \n    float cut = (p.xz*=rot(pi/4.0-0.15)).y;\n    tip = max(-cut+len2/2.0,tip);\n    a.x = min(a.x,tip);\n    b.x = tip;\n    a.x-=0.4;\n    p = po;\n    p.xz*=rot(pi/4.0);\n    p.xy*=rot(-0.9553155);\n    po = p;\n    n.xz*=rot(pi/4.0);\n    n.xy*=rot(-0.9553155);\n    p.xz-=n.xy;\n    p.xz*=rot(-iTime*0.3);\n    if(hitonce)a.x = max(a.x,-vorMap(vec3(p.x,p.z,rlg+n.z)*0.35+3.)+va*1.6);\n    p = po;\n    b.y = 3.0;\n    p-=n;\n    p.xz*=rot(pi/6.0);\n    p.x+=1.75;\n    p.z+=0.4;\n    po = p;\n    for(float i = 0.; i<3.; i++){ //blocks\n        b.y+=i;\n        p.xz*=rot((2.0*pi/3.0)*i);\n        float t = (iTime+i*((2.0*pi)/9.0))*3.;\n        p.y-=35.-50.*step(sin(t),0.);\n        p.x+=4.5;\n        p.xy*=rot(t);\n        p.x-=4.5;\n        p.xz*=rot(t);\n        b.x = box(p,vec3(1.5,.5,.5))-0.25;\n        a = (a.x<b.x)?a:b;\n        p = po;\n    }\n    return a;\n}\nvec3 norm(vec3 p){\n    vec2 e= vec2(0.0001,0);\n    return normalize(map(p,vec3(0)).x-vec3(\n    map(p,e.xyy).x,\n    map(p,e.yxy).x,\n    map(p,e.yyx).x));\n}\n\nvoid render(out vec4 fragColor, in vec2 fragCoord){\n    vec2 uv = (fragCoord-0.5*iResolution.xy)/iResolution.y;\n    vec3 col = vec3(0);\n    uv.x-=0.025;\n    vec2 uv2 = uv;\n    vec2 uv3 = uv;\n    \n    //Calculating the animation for the size wobble and voronoi crumble\n    uv2.y-=0.1;\n    uv2*=rot(iTime*1.25);\n    float ang =atan(uv2.x,uv2.y)/(pi*2.)+0.5;\n    float range = 0.175;\n    #ifdef WOBBLE\n    sa = sin(ang*10.+iTime*2.5)*0.3;\n    #endif\n    ang = smoothstep(0.0,range,ang)*smoothstep(0.0,range,1.0-ang);\n    va = (1.0-ang)*0.175;\n    uv*=rot(-pi/6.0);\n    \n    vec3 ro = vec3(5,5,5)*6.5;\n    \n    #ifdef CAM\n    if(iMouse.z>0.){\n        ro.yz*=rot(2.0*(iMouse.y/iResolution.y-0.5));\n        ro.zx*=rot(-7.0*(iMouse.x/iResolution.x-0.5));\n    }    \n    #endif\n    \n    //maybe there is an easier way to make an orthographic target camera\n    //but this is what I figured out\n    vec3 lk = vec3(0,0,0);\n    vec3 f = normalize(lk-ro);\n    vec3 r = normalize(cross(vec3(0,1,0),f));\n    vec3 rd = f+uv.x*r+uv.y*cross(f,r);\n    ro+=(rd-f)*17.0;\n    rd=f;\n\n    vec3 p = ro;\n    float rl = 0.;\n    vec2 d= vec2(0);\n    float shad = 0.;\n    float rlh = 0.;\n    float i2 = 0.; \n    \n    //Spaghetified raymarcher \n    for(float i = 0.; i<STEPS; i++){\n        p = ro+rd*rl;\n        d = map(p, vec3(0));\n        rl+=d.x;\n        if((d.x)<0.0001){\n            shad = i2/STEPS;\n            if(hitonce)break;\n            hitonce = true;\n            rlh = rl;\n        }\n        if(rl>MDIST||(!hitonce&&i>STEPS-2.)){\n            d.y = 0.;\n            break;\n        }\n        rlg = rl-rlh;\n        if(hitonce&&rlg>3.0){hitonce = false; i2 = 0.;}  \n        if(hitonce)i2++;\n    }\n    //Color Surface\n    if(d.y>0.0){\n        vec3 n = norm(p);\n        vec3 r = reflect(rd,n);\n        vec3 ld = normalize(vec3(0,1,0));\n        float spec = pow(max(0.,dot(r,ld)),13.0);\n\n        //Color the triangle\n        vec3 n2 = n*0.65+0.35;\n        col += mix(vec3(1,0,0),vec3(0,1,0),sat(uv3.y*1.1))*n2.r;\n        uv3*=rot(-(2.0*pi)/3.0);\n        col += mix(vec3(0,1.0,0),vec3(0,0,1),sat(uv3.y*1.1))*n2.g;\n        uv3*=rot(-(2.0*pi)/3.0);\n        col += mix(vec3(0,0,1),vec3(1,0,0),sat(uv3.y*1.1))*n2.b;\n        \n\n        \n        //NuSan SSS\n        float sss=0.5;\n        float sssteps = 10.;\n        for(float i=1.; i<sssteps; ++i){\n            float dist = i*0.2;\n            sss += smoothstep(0.,1.,map(p+ld*dist,vec3(0)).x/dist)/(sssteps*1.5);\n        }\n        sss = clamp(sss,0.0,1.0);\n        \n        //blackle AO\n        #define AO(a,n,p) smoothstep(-a,a,map(p,-n*a).x)\n        float ao = AO(1.9,n,p)*AO(3.,n,p)*AO(7.,n,p);\n        \n        //Apply AO on the triangle\n        if(rlg<0.001){\n            col*=mix(ao,1.0,0.2);\n        }\n        //Color the inside of the crumbled bits \n        else {\n            col = vec3(0.2-shad);\n        }\n        //Color the moving blocks\n        if(d.y>1.0){\n            col = (n*0.6+0.4)*vec3(sss)+spec;\n        }\n        //a bit of gamma correction\n        col = pow(col,vec3(0.7));\n    }\n    //Color Background\n    else{\n        vec3 bg = mix(vec3(0.345,0.780,0.988),vec3(0.361,0.020,0.839),length(uv));\n        col = bg;\n    }\n    fragColor = vec4(col,1.0);\n}\n\n//External AA, (I compacted it for fun)\nvoid mainImage(out vec4 O,vec2 C){\n    float px=1./AA,i,j;vec4 cl2,cl;\n    if(AA==1.){render(cl,C);O=cl;return;}\n    for(i=0.;i<AA +min(iTime,0.0);i++){for(j=0.;j<AA;j++){\n    vec2 C2 = vec2(C.x+px*i,C.y+px*j);\n    render(cl2,C2);cl+=cl2;\n    rlg=0.; hitonce = false;\n    }}cl/=AA*AA;O=cl;\n}',
        name: 'Image',
        description: '',
        type: 'image',
      },
    ])

    return shaderToyPlayer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { shaderToyPlayer } = def

    precision mediump float ;
    uniform vec2 u_CanvasSize ;
    float pi2 = radians(360.0);
    float rand (vec2 fragCoord){
        vec2 a = vec2(0.1234, 0.5678);
        float n =  dot(fragCoord, a) ;
        return fract(sin(n)*10000.0);
    }


    void main() {
    vec2 center  = u_CanvasSize / 2.0;
        vec2 p = gl_FragColor.xy - center ;
        // atan 值域 [-π， π]
        float ang = atan(p.y,p.x) ;
        float x = ang* 16.0 ;
        vec2 v = vec2(int(x), 0) ;

        float f = rand(v) ;
        gl_FragColor = vec4(f,f,f,1); 
    }
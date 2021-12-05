    precision mediump float ;
    uniform vec2 u_CanvasSize ;
    uniform float u_Spin ;
    uniform float u_Stamp ;
  
    float pi2 = radians(360.0);
// 采样器
      uniform  sampler2D u_Sampler;
     float getAngle (vec2 v) {
         float ang = atan(v.y, v.x);
         if (ang < 0.0) {
             ang += pi2 ;
         }
         return ang ;
     } 

// 放射也是角度渐变的一种 只不过这里把换成了对应的亮度 看上去就只有黑白
// 之前的是分段的现在是连续的
    void main() {

        vec2 center  = u_CanvasSize / 2.0;
        float diagLen = length(center) ; 
        vec2 p = gl_FragCoord.xy - center ;
        float ang = getAngle(p) ;
        float x = ang / pi2 ; //  ang的范围是[0， 2π] 所以这个结果是[0,1]
        float len = length(p); // 片元到中心的距离
        float y = len / diagLen ; // 画布对角线的一半
        vec4 color = texture2D(u_Sampler, vec2(x,y)) ;
        if (p.x > 0.0 && abs(p.y) < 1.5){
            color  = texture2D(u_Sampler, vec2(0,y) ) ;
        }
        gl_FragColor = color ;    
    }
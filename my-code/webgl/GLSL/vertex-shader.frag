 precision  mediump float;
    uniform vec4 a_Color  ;
    uniform vec2 u_CanvasSize ;
// 数据 四阶矩阵
    uniform mat4 u_ColorStops ;
     uniform  vec2 u_Start ;
     uniform  vec2 u_End  ;

float pi2  = radians(360.0) ;

 
// 定义变量不要用其他的变量来初始化
    vec2 se = u_End - u_Start ;  // 渐变方向向量
    float seLen  = length(se);  // 向量的模

    vec2 se1  = normalize(se) ;// 单位向量化

  /*  算出当前片元颜色 */
    vec4 getColor( vec4 colors[8], float ratios[8]) {
        vec4 color  = vec4(1) ;// 片元颜色

        vec2 sf  = vec2(gl_FragCoord) - u_Start ; // 当前片元减起始 ob - oa ab 结果就是起始指向当前
        // 当前片元在se上的投影长度   dot 向量积 点乘 
        // 好像只要用点积除以另一向量的模就可以了 dot(vec2(gl_FragCoord), se) / seLen 
        /* T 为任意 float, vec类型
        T clamp(T x, T minVal, T maxVal) ;
        T clamp(T x, float minVal,float maxVal);
        min(max(x, minVal), maxVal),返回值被限定在 minVal,maxVal之间
        */

        // float fsLen  = clamp(dot(sf,se1), 0.0,seLen) ;

        //长度比
        // float ratio  = clamp(fsLen/seLen , ratios[0], ratios[8-1]) ;

        // 当前片元到圆心距离
        float fsLen  = distance(gl_FragCoord.xy, u_Start) ;
        //  极径比
        // float  ratio  =clamp(fsLen / seLen, ratios[0], ratios[8-1] );

        // 片元相对于渐变起点的方向
        float dir = atan(sf.y, sf.x) ;

        if (dir < 0.0) {
            dir += pi2 ;
        }
        //  极角比
        float ratio = dir / pi2 ;
        // 第一个比值
        float ratio1 = ratios[0] ;
        // 第一个颜色 
        vec4 color1 = colors[0] ;

        float angle  = asin(distance(gl_FragCoord.xy, vec2(0,0)) / gl_FragCoord.x) ;
        // 按比值取色
        for(int i =1; i< 8; i++) {
            // 第二个比值 ,颜色
            float ratio2 = ratios[i] ;
            vec4 color2 = colors[i] ;
            if (ratio >= ratio1 && ratio <= ratio2 ) {
                // 颜色差值
                vec4 color2_1  = color2 - color1 ;
                // 当前比值在一段比值中的比值
                float ratioInRatio = (ratio -ratio1)/(ratio2 - ratio1);
                // 当前比值在当前色段中对应的色值
                color  = color1 + color2_1 * ratioInRatio ;
                break ;
                
            }

            ratio1 = ratio2 ;
            color1 = color2 ;
        }
        return color ;

    }
    //  out 关键字 有点浅拷贝的意思
    void setColorStop(int rgb , int ar ,out vec4 color , out float ratio) {
        // rbg  = 123001131
        int rc = rgb / 1000000 ; // 123 
        int gc = (rgb - rc*1000000) /1000 ;
        int bc = rgb - int(rgb / 1000)* 1000 ;
        int ac = ar / 1000 ;
        int ratioI = ar-ac* 1000 ;
        color = vec4(float(rc),float(gc),float(bc),float(ac) ) / 255.0;
        ratio = float(ratioI ) / 255.0 ;
    }

    void setColorStops( out vec4 colors[8], out float ratios[8]) {
        // 节点颜色 位置数据
            vec4 colorSource = vec4(1) ;
            float ratioSource  =1.0 ;
            //  遍历矩阵
            for(int y = 0; y < 4; y++) {
                for (int x =0; x< 2 ; x++) {
                    int rgb = int (u_ColorStops[y][x*2]) ; // 偶数列
                    int ar = int(u_ColorStops[y][x*2 +1]);
                    if (rgb > 0) {
                        setColorStop(rgb, ar, colorSource, ratioSource) ;
                    }
                    colors[y*2+x] = colorSource ;
                    ratios[y*2+x] = ratioSource ;
                }
            }
    }

    void main() {
        /*片元的位置 原点在左下角 值域就是px*/
        /*线性渐变就是在某个方向上变化 ，那么垂直于这个方向上的颜色应该就是一致的*/
        // 同一直线 截距不变 
        vec4 colors[8] ;
        float ratios[8];

        setColorStops(colors, ratios) ;
        gl_FragColor = getColor(colors, ratios) ;
    }
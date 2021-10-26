  precision mediump float;
    uniform vec2 u_CanvasSize;
    //起始位
    uniform vec2 u_Start;
    //结束位
    uniform vec2 u_End;
    //四阶矩阵
    uniform mat4 u_ColorStops;

    //终点减起点向量
    vec2 se=u_End-u_Start;
    //长度
    float seLen=length(se);
    //单位向量
    vec2 se1=normalize(se);

    //获取片元颜色
    vec4 getColor(vec4 colors[8],float ratios[8]){
      //片元颜色
      vec4 color=vec4(1);
      //当前片元减起始片元的向量
      vec2 sf=vec2(gl_FragCoord)-u_Start;
      //当前片元在se上的投影长度
      float fsLen=clamp(dot(sf,se1),0.0,seLen);
      //长度比
      float ratio=clamp(fsLen/seLen,ratios[0],ratios[8-1]);
      //第一个比值
      float ratio1=ratios[0];
      //第一个颜色
      vec4 color1=colors[0];
      //遍历节点，按比值取色
      for(int i=1;i<8;i++){
        //第二个比值
        float ratio2=ratios[i];
        //第二个颜色
        vec4 color2=colors[i];
        if(ratio>=ratio1&&ratio<=ratio2){
          //一段颜色的差值
          vec4 color2_1=color2-color1;
          //当前比值在一段比值中的比值
          float ratioInRatio=(ratio-ratio1)/(ratio2-ratio1);
          //当前比值在当前颜色段中所对应的颜色
          color=color1+color2_1*ratioInRatio;
          break;
        }
        ratio1=ratio2;
        color1=color2;
      }
      return color;
    }

    void setColorStop(int rgb,int ar,out vec4 color,out float ratio){
      //rgb=123000120  
      int rc=rgb/1000000; //123
      //(123000120-123000000)/1000=120/1000=0.12=0
      int gc=(rgb-rc*1000000)/1000;
      //123000120-123000000=120
      int bc=rgb-int(rgb/1000)*1000;
      int ac=ar/1000;
      int ratioI=ar-ac*1000;
      color=vec4(float(rc),float(gc),float(bc),float(ac))/255.0;
      ratio=float(ratioI)/255.0;
    }

    void setColorStops(out vec4 colors[8],out float ratios[8]){
      //节点颜色数据
      vec4 colorSource=vec4(1);
      //节点位置数据
      float ratioSource=1.0;
      //遍历四维矩阵的
      for (int y=0;y<4;y++){
          for (int x=0;x<2;x++){
              int rgb=int(u_ColorStops[y][x*2]);
              int ar=int(u_ColorStops[y][x*2+1]);
              if(rgb>0){
                  setColorStop(rgb,ar,colorSource,ratioSource);
              }
              colors[y*2+x]=colorSource;
              ratios[y*2+x]=ratioSource;
          }
      }
    }

    void main(){
      //节点颜色集合
      vec4 colors[8];
      //节点位置集合
      float ratios[8];
      //基于四维矩阵解析节点集合
      setColorStops(colors,ratios);  
      //片元颜色
      gl_FragColor=getColor(colors,ratios);
    }
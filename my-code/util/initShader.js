export function initShaders(gl, vsSource, fsSource) {
    const program = gl.createProgram();//程序对象
    const vetexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);// 顶点 着色器对象
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER,fsSource);// 片元 着色器对象
    gl.attachShader(program, vetexShader) // 把着色器对象装进程序对象中
    gl.attachShader(program, fragmentShader) // 把着色器对象装进程序对象中
    gl.linkProgram(program) // 连接webgl上下文对象和程序对象
    gl.useProgram(program);// 启动程序
    gl.program = program;//将程序对象挂到gl上下文
} 

function loadShader(gl, type, source){
    const shader = gl.createShader(type);// 根据着色器类型，建立着色器对象
    gl.shaderSource(shader, source) // 将着色器源文件传入着色器对象
    gl.compileShader(shader);//编译着色器对象
    return shader ;//返回着色器对象
}

export  class Compose {
    constructor() {
      this.parent = null;
      this.children = [];
    }
    add(obj) {
      obj.parent = this;
      this.children.push(obj);
    }
    update(t) {
      this.children.forEach((ele) => {
        ele.update(t);
      });
    }
  }
  export  class Track {
    constructor(target) {
      this.target = target;
      this.parent = null;
      this.start = 0;
      this.timeLen = 5;
      this.loop = false;
      this.keyMap = new Map();
    }
    update(t) {
      const { keyMap, timeLen, target, loop, start } = this;
      //本地时间
      let time = t - start;
      if (loop) {
        time = time % timeLen;
      }
      for (const [key, fms] of keyMap) {
        const last = fms.length - 1;
        if (time < fms[0][0]) {
          target[key] = fms[0][1];
        } else if (time > fms[last][0]) {
          target[key] = fms[last][1];
        } else {
          target[key] = getValBetweenFms(time, fms, last);
        }
      }
    }
  }
  
  function getValBetweenFms(time, fms, last) {
    for (let i = 0; i < last; i++) {
      const fm1 = fms[i];
      const fm2 = fms[i + 1];
      if (time >= fm1[0] && time <= fm2[0]) {
        const delta = {
          x: fm2[0] - fm1[0],
          y: fm2[1] - fm1[1],
        };
        const k = delta.y / delta.x;
        const b = fm1[1] - fm1[0] * k;
        return k * time + b;
      }
    }
  }
  

 export function getMousePosInWebgl({clientX, clientY},canvas){
    //鼠标在画布中的css位置
    const { left, top, width, height } = canvas.getBoundingClientRect();
    const [cssX, cssY] = [clientX - left, clientY - top];
    //解决坐标原点位置的差异
    const [halfWidth, halfHeight] = [width / 2, height / 2];// 这就是坐标原点
    const [xBaseCenter, yBaseCenter] = [
      cssX - halfWidth,
      cssY - halfHeight,
    ];
    // 解决y 方向的差异
    const yBaseCenterTop = -yBaseCenter;
    //解决坐标基底的差异
    return {
      x:xBaseCenter / halfWidth,
      y:yBaseCenterTop / halfHeight
    }
  }
  
  export function ScaleLinear(ax,ay,bx,by){
    const delta = {
      x: bx-ax,
      y: by- ay
    }
    const  k = delta.y / delta.x ;
    const  b = ay -ax * k ;
    return function(x){
      return x * k  + b
    }
  }
/**
 * 在由一维数组建立的栅格矩阵中，基于行列获取元素的索引位置 
 * @param {*} w 
 * @param {*} size 
 */
  function GetIndexInGrid(w,size) {
    return function (x,y) {
      return (y*w + x) * size
    }
  }


export {GetIndexInGrid} ;

















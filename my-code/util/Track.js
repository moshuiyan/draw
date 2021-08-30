export default class Track {
    constructor(target) {
      this.target = target;
      this.parent = null;
      this.start = 0;
      this.timeLen = 5; // 一个时间轨的总长
      this.loop = false;
      this.keyMap = new Map();
    }
    update(t) {
      const { keyMap, timeLen, target, loop, start } = this;
      //时间间隔
      let time = t - start;       // 这里的start 只是创建的start并不会更新
      if (loop) {
        time = time % timeLen; //不开启循环 间隔大于最后的时间戳，轨道便停止
      }
      for (const [key, fms] of keyMap) {  // 数组第一位时间轨控制的属性， 第二位 二维数组（每行存当前时间 及变量的值
        const last = fms.length - 1;
        if (time < fms[0][0]) { // 时间间隔小于时间戳，便是在这一帧，该取这个值
          target[key] = fms[0][1];
        } else if (time > fms[last][0]) {
          target[key] = fms[last][1];  // 在最后一个范围内
        } else {
          target[key] = getValBetweenFms(time, fms, last);
        }
        // for (const timer of fs) {
        //   if (time < timer[0] ){
        //     target[key] = timer[1];
        //     break ;
        //   }else{
        //     continue ;
        //   }
        // }
      }
    }
  }
  
  function getValBetweenFms(time, fms, last) { // 补间，这个就是线性补间啊
    for (let i = 0; i < last; i++) {
      const fm1 = fms[i];
      const fm2 = fms[i + 1];
      if (time >= fm1[0] && time <= fm2[0]) {
        const delta = {
          x: fm2[0] - fm1[0],
          y: fm2[1] - fm1[1],
        };
        const k = delta.y / delta.x;   // 斜率， 这里应为属性值随时间的变化率
        const b = fm1[1] - fm1[0] * k; //y轴截距 b = y -ax
        return k * time + b; // 这里要返回的是因变量的值，
      }
    }
  }
  
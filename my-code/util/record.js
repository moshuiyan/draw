function creatRecord (){
  return async function(){
    /* 
    通过 MediaDevices.getUserMedia() 获取用户多媒体权限时，需要注意其只工作于以下三种环境：

1、localhost 域

2、开启了 HTTPS 的域

3、使用 file:/// 协议打开的本地文件（难怪我特么本地直接开也能用！）

其他情况下，比如在一个 HTTP 站点上，navigator.mediaDevices 的值都为 undefined。

得知真相的我：“localhost
————————————————
版权声明：本文为CSDN博主「private_static」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/qq_41973208/article/details/107950274 */
      /* 这里没有处理拒绝的逻辑 会直接抛出error */
    let stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });
      let mine, mediaRecorder
      if(MediaRecorder){
       mine = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')? "video/webm; codecs=vp9"  : "video/webm";
        mediaRecorder = new MediaRecorder(stream, { mimetype:mine})
      }
      /* 存储流 */
      let chunks = []
        mediaRecorder.addEventListener('dataavailable', function(e) {
            chunks.push(e.data)
        })
    
       mediaRecorder.addEventListener('stop', function(){
          let blob = new Blob(chunks, {
              type: chunks[0].type
          })
          let url = URL.createObjectURL(blob)
          let a = document.createElement('a')
          a.href = url
          a.download = 'video.webm'
          a.click()
      })
    
      mediaRecorder.start() ;
}
}

export { creatRecord}



function plus(a ){
  return a +1
}

function cheng(a){
  return a *2
}
// 2 + (2*3) f1(x)=x+1;   f2(x)= 2x;  f1(f2(3))
let a = plus(cheng(3))

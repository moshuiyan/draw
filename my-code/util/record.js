function creatRecord (){
  return async function(){
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

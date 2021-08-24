const  defAttr = () => ({   //默认值   原来是返回一个对象的方法
    gl: null,
    vertices: [],  // 
    geoData: [],   // 对象数组
    size: 2,      //  分量数
    attrName: 'a_Position',
    count: 0,    // 点数
    types: ['POINTS']    // 绘图方式
});

export default class Poly {
    // 走 对象数组
    constructor(attr) {
        //           target source1 source2
        Object.assign(this,defAttr(), attr);
        this.init()
    }
    init() {
        const {attrName, size, gl} = this;
        if(!gl) { return ; }
        const vertexBuffer  = gl.createBuffer();
        // gl.bindBuffer(target, buffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        this.updateBuffer(gl);
        const a_Position = gl.getAttribLocation(gl.program, attrName);
        // gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
        gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0);
        // 赋能批处理
        gl.enableVertexAttribArray(a_Position);
    }

    addVertice(...params) {
        this.vertices.push(...params);
        this.updateBuffer();

    }
    popVertice() {  //这个删除逻辑 就是删除后面size个元素
        const { vertices, size} = this;
        const len = vertices.length;
        vertices.splice(len-size,len);
        this.updateCount()
    }
    setVertice(index, ...params) {  // 这种写法像splice，不过这里增删相抵即为修改
        const {vertices, size} = this ;
        const i = size * index ;
        params.forEach( (el, ind) => {
            vertices[ind + i] = el ;
        })
    }
    updateVertices(params){ // 要更新的key值,用对象数组来更新原始数组
        const {geoData} = this ;
        const vertices = [] ;
        geoData.forEach(el => {
            params.forEach( key => {
               vertices.push(el[key]) ;  
            })
        })

        this.vertices = vertices ;
    }

    updateBuffer() {
        const {gl, vertices} = this;
        this.updateCount();
        // gl.bufferData(target, size, srcData Optional, usage, srcOffset, length Optional)        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW )        ;
 
    }

    updateCount() {
        this.count = (this.vertices.length / this.size ) | 0 ;
    }
    draw( types = this.types) {
        const {gl, count} = this ;
        for (const  type of types) {
            gl.drawArrays(gl[type], 0, count)
        }
    }
}


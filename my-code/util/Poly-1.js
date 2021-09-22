const  defAttr = () => ({   //默认值   原来是返回一个对象的方法
    gl: null,
    source: [] ,    // 数据集 行扩展矩阵
    sourceSize: 0,   // 一行的分量
    elementBytes: 4,   // 元素字节数 32位 就是4 字节
    categoryBytes:0,   // 类目字节数 一行元素个数 * 元素字节
    categorySize: 4,   // 类目尺寸 一行的系列数  
    vertices: [],  // 原始数据数组
    geoData: [],   // 对象数组
    size: 2,      //  分量数
    attrName: 'a_Position',
    uniforms: {},
    attributes: {},
    /* attributes: {
        a_Position: {
            index: 0,
            size: 3
        }
    }
    uniforms : {
        u_Color: {
            type: 'uniform1f',修改方法
            value: 1,  值+
        }
    }
    } */
    count: 0,    // 点数
    types: ['POINTS'],    // 绘图方式
    circleDot:false,    // 是否启用圆点
    u_IsPOINTS:null
});

export default class Poly {
    constructor(attr) {
        //           target source1 source2
        Object.assign(this,defAttr(), attr);
        this.init()
    }
    init() {
        const {attrName, size, gl, circleDot,attributes,elementBytes, source} = this;
        if(!gl) { return ; }
        /* 启用数据集*/
        if(source && source.length){
            this.calculateSourceSize()
            this.updateAttribute()
            this.updateUniform()
            return  ;
        }



        const vertexBuffer  = gl.createBuffer();
        // gl.bindBuffer(target, buffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        this.updateBuffer();
        const a_Position = gl.getAttribLocation(gl.program, attrName);
        // gl.vertexAttribPointer(index, size, type, normalized, stride, offset)
        gl.vertexAttribPointer(a_Position, size, gl.FLOAT, false, 0, 0);
        // 赋能批处理
        gl.enableVertexAttribArray(a_Position);
        if (circleDot) {
            this.u_IsPOINTS = gl.getUniformLocation(gl.program,'u_IsPOINTS')
        }

        this.updateUniform() ;
    }
    updateUniform() {
        const { gl, uniforms } = this ;
        for(let [key,val] of Object.entries(uniforms)){
 /* type 是表示设置uniform变量的方式,  */
            const { type, value} = val ;
            const u = gl.getUniformLocation(gl.program, key) ;
            if (type.includes('Matrix')){
                gl[type](u,false,value) ;
            }else {
                gl[type](u,false) ;
            }
        }
    }

    updateAttribute() {
         const { gl,attributes, categoryBytes, source } = this ;
         const sourceBuffer = gl.createBuffer() 
         gl.bindBuffer(gl.ARRAY_BUFFER, sourceBuffer) 
         gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source), gl.STATIC_DRAW)

         for (let  [key, { size, byteIndex} ] of Object.entries(attributes)) {
            const attr  = gl.getAttribLocation(gl.program, key) 
            gl.vertexAttribPointer(
                attr,
                size,
                gl.FLOAT,
                false,
                categoryBytes,
                byteIndex
            )
            gl.enableVertexAttribArray(attr)
         }
    }
/**
 * 基于数据集 计算 类目尺寸 类字节数 顶点数
 */
    calculateSourceSize() {
        const { source , attributes, elementBytes} = this ;
        let categorySize = 0 ;
        Object.values(attributes).forEach( (prop) => {
            const { size, index} = prop ;
            categorySize +=  size ;
            prop.byteIndex = index * elementBytes  ;

        })

        this.categorySize = categorySize
        this.categoryBytes = categorySize * elementBytes 
        this.sourceSize = source.length / categorySize 


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
    updateVertices(params){ // 要更新的key值,用对象数组来更新原始数组 ,调这个就是用对象数组
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
        const {gl, count,sourceSize,circleDot,u_IsPOINTS} = this ;
        for (const  type of types) {
        circleDot && gl.uniform1f(u_IsPOINTS, type === 'POINTS');
        if(sourceSize >0){
            gl.drawArrays(gl[type], 0, sourceSize)
        }else if (count > 0){

            gl.drawArrays(gl[type], 0, count);
        }
        }
    }
}


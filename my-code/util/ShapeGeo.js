export default class ShapeGeo {
    constructor(pathData = []){
        this.pathData = pathData ;  // 路径点位数据
        this.geoData = [];
        this.triangles =[];  // 三角形数据
        this.vertices = [];
        this.parsePath();
        this.update();
    }

    update(){
        this.triangles = [];
        this.vertices = [];
        this.findTriangle(0);
        this.updateVertices();
    }

    parsePath(){
        this.geoData = [];
        const {pathData,geoData } = this ;
        for(let i= 0; i< pathData.length ;i+=2){
            geoData.push({x:pathData[i], y:pathData[i+1]})
        }
    }

    findTriangle(i){
        const {geoData, triangles} = this ;
        const len =  geoData.length;
        if (len <= 3) {  // 小于3可不就是三角形  
            triangles.push([...geoData]);
        }else {
            const [i0,i1,i2] = [
                i % len ,
                (i+1)% len,
                (i + 2)% len
            ];
            const triangle = [
                geoData[i0],
                geoData[i1],
                geoData[i2],
            ];
            if (this.cross(triangle)> 0 &&!this.includePoint(triangle)){
                triangles.push(triangle);
                geoData.splice(i1,1);

            }
            this.findTriangle(i1);
        }
    }

    includePoint(triangle){
        for (let el of this.geoData){
            if(!triangle.includes(el)) {
                if (this.inTriangle(el ,triangle)){
                    return true
                }
            }
        }
        return false ;
    }

    inTriangle(p0,triangle) {
        let  inPoly = true ;
        for (let i = 0;i< 3;i++) {
            const j = (i +1)% 3
            const [p1,p2] = [triangle[i], triangle[j]];
            if (this.cross([p0,p1,p2]) < 0){
                inPoly =false ;
                break ;
            }
        }
        return inPoly ;
    }
    cross([p0,p1,p2]){
        const [ax,ay,bx,by] = [
            p1.x - p0.x,
            p1.y - p0.y,
            p2.x - p0.x,
            p2.y - p0.y
        ];
        return ax* by - bx* ay ;
    }

    updateVertices(){
        const arr = [] ;
        this.triangles.forEach( (triangel ) => {
            for(let {x,y} of triangel){
                arr.push(x,y)
            }
        })

        this.vertices = arr ;
    }
}

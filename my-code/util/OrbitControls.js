import { Matrix4, Spherical, Vector2, Vector3, } from '../../crystalocean-three.js-master/three.js/build/three.module.js'
const pi2 = Math.PI;
const pvMatrix = new Matrix4()
const defArr = () => ({
    camera: null,
    dom: null,       // canvas元素
    target: new Vector3(),
    mouseButtons: new Map([
        [0, 'rotate'],
        [2, 'pan'],
    ]),
    state: 'none',
    dragStart: new Vector2(),            //存储位移起始的中间变量
    dragEnd: new Vector2(),              //存储位移结束的中间变量
    panOffset: new Vector3(),                   //存储位移的中间变量
    screenSpancePanning: true,     //鼠标纵向移动 相机是否y轴方向移动
    zoomScale: 0.95,
    spherical: new Spherical(),
    rotateDir: 'xy',   // 允许以x y为轴的旋转
})

export default class OrbitControls {
    constructor(attr) {
        Object.assign(this, defArr(), attr)
        this.updateSpherical()
        this.update()
    }

    updateSpherical() {
        const { spherical, camera, target } = this;
        spherical.setFromVector3(camera.position.clone().sub(target))
    }
    /* 0左 1滚轮 2右  clientX 就是screen  这个事件是有pageXY的*/
    pointerdown = ({ clientX, clientY, button }) => {
        /* type是three的相机有的属性 默认是Camera , OrthographicCamera PerspectiveCamera */
        const { dragStart, mouseButtons } = this
        dragStart.set(clientX, clientY)
        
        this.state = mouseButtons.get(button)
    }

    pointermove = ({ clientX, clientY }) => {
        const { dragStart, dragEnd, state, camera: { type } } = this
        dragEnd.set(clientX, clientY)
        switch (state) {
            case 'pan':
                this[`pan${type}`](dragEnd.clone().sub(dragStart))
                break
            case 'rotate':
                this.rotate(dragEnd.clone().sub(dragStart))
                break;
                default:
                break;
        }
        dragStart.copy(dragEnd)/*  */
    }

    pointerup = () => {
        this.state = 'none'
    }

    wheel = ({ deltaY }) => {
        const { zoomScale, camera: { type } } = this;
        let scale = deltaY < 0 ? zoomScale : 1 / zoomScale;
        this[`dolly${type}`](scale)
        this.update()
    }
    /* 正交相机是缩放相机世界 */
    dollyOrthographicCamera(dollScale) {
    
        const { camera } = this;
        camera.zoom *= dollScale;
        camera.updateProjectionMatrix();
    }
    
    /* 透视相机是改变视距 */
    dollyPersperctiveCamera(dollScale) {
        this.spherical.radius /= dollScale;
    }
    /* 相机的位移会同时作用到目标点和视点 */
    /* 正交相机是直接按比例把位移 换算成相近世界的位移 也不存在z轴移动， 因为看不出来效果 */
    panOrthographicCamera({ x, y }) {
        const {
            camera: { matrix, position, top, right, bottom, left, up },
            dom: { clientHeight, clientWidth },
            panOffset, screenSpancePanning, target
        } = this;
        const cameraW = right - left;
        const cameraH = top - bottom;

        const ratioX = y / cameraH;
        const ratioY = x / cameraW;

        const distanceLeft = x * ratioY
        const distanceUp = y * ratioX

        const mx = new Vector3().setFromMatrixColumn(matrix, 0);
        const vx = mx.clone().multiplyScalar(-distanceLeft);
        const vy = my.clone().multiplyScalar(distanceUp);

        const myOrz = new Vector3();
        if (screenSpancePanning) {
            vy.setFromMatrixColumn(matrix, 1)
        } else {
            // myOrz.setFromMatrixColumn(matrix, 2)
            vy.cross(up, mx)
        }

        panOffset.copy(vx.add(vy));
        this.update()
    }
    /* 透视相机是先按比例把位移 换算成相近世界的中心裁剪面的位移 然后按fov夹角线性变换其他点位 默认竖直运动 是z轴移动，  */
    panPersperctiveCamera({ x, y }) {
        const {
            camera: { matrix, position, fov, up },
            dom: { clientHeight },
            panOffset, screenSpancePanning, target
        } = this;
        const sightLen = position().sub(target).lenght()

        const angle = fov / 2 / 360 * pi2
        const targetHeight = sightLen * Math.tan(angle);
        const ratio = targetHeight / clientHeight;

        const distanceLeft = x * ratio
        const distanceUp = y * ratio

        const mx = new Vector3().setFromMatrixColumn(matrix, 0);

        const myOrz = new Vector3();
        if (screenSpancePanning) {
            myOrz.setFromMatrixColumn(matrix, 1)
        } else {
            // myOrz.setFromMatrixColumn(matrix, 2)
            myOrz.cross(up, mx)
        }

        const vx = mx.clone().multiplyScalar(-distanceLeft);
        const vy = my.clone().multiplyScalar(distanceUp);
        panOffset.copy(vx.add(vy));
        this.update()
    }
    /* 相机旋转都是目标点不动 视点(也就是相机中心)绕视点转  */
    rotate({ x, y }) {
        const {
            dom: { clientHeight },
            spherical, rotateDir,

        } = this

        const deltaT = pi2 * x / clientHeight;  // 方位角[0, 360]
        const deltaP = pi2 * y / clientHeight;  // 极角(0, 180)
        if (rotateDir.includes('x')) { spherical.theta -= deltaT }
        if (rotateDir.includes('y')) {
            const phi = spherical.phi - deltaP;
            spherical.phi = Math.min(pi2 / 200000, Math.max(0.000001, phi))
        }
        this.update()


    }
    /* 更新视图矩阵  完毕重置中间变量  */
    update() {
        const { camera, target, spherical, panOffset } = this;
        /* 算出新的视点 目标点用于平移 */
        target.add(panOffset)
        camera.position.add(panOffset);

        /* 球坐标缩放 球心不动 极径变 也就是目标点的极径方向上的位移  所以谁是球心*/
        const rotateOffset = new Vector3().setFromSpherical(spherical);
        camera.position.copy(target.clone().add(rotateOffset))

        // 
        camera.lookAt(target);
        camera.updateMatrixWorld(true);

        // reset  看来我对相机的球坐标不熟
        spherical.setFromVector3(
            camera.position.clone().sub(target)
        )

        panOffset.set(0, 0, 0)
    }
    getPvMatrix() {
        const { camera: { projectionMatrix, matrixWorldInverse } } = this;
        return pvMatrix.multiplyMatrices(projectionMatrix, matrixWorldInverse)
    }
}
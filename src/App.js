import * as THREE from 'three';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { PointLight } from 'three/src/lights/PointLight.js';
import { AmbientLight } from 'three/src/lights/AmbientLight.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Shape } from 'three/src/extras/core/Shape.js';
import { ExtrudeGeometry } from 'three/src/geometries/ExtrudeGeometry.js';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial.js';
import { Mesh } from 'three/src/objects/Mesh.js';

//scene
let canvas, camera, scene, light, light2, renderer;
let objectsArray = [];

class MeshObj {
    constructor(sizeVector, color, rotation, position, moveDirection) {
        const materialExtr = new MeshPhongMaterial({ color: color });
        let RoundedBox = createBoxWithRoundedEdges(sizeVector.x, sizeVector.y, sizeVector.z, 1, 100);
        this.mesh = new Mesh(RoundedBox, materialExtr);
        this.startAngle = rotation;
        this.startPosition = position;
        this.moveDirection = moveDirection;
        this.mesh.rotation.setFromVector3(rotation);
        this.mesh.position.copy(position);
    }
}

class App {
    init() {
        canvas = document.getElementById('main3DCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);

        //scene and camera
        scene = new Scene();
        camera = new PerspectiveCamera(40.0, window.innerWidth / window.innerHeight, 0.1, 5000);
        camera.position.set(0, 0, 100);

        //light
        light = new PointLight(0xffffff, 0.2);
        light.position.set(0, 50, 60);
        scene.add(light);
        light2 = new AmbientLight(0xffffff, 0.8);
        light2.position.set(0, 100, 100);
        scene.add(light2);

        /*
                objectsArray.push(new MeshObj(
                    new Vector3(10, 10, 10),
                    0xf7f7f7,
                    new Vector3(0.0, 0.4, -0.5),
                    new Vector3(0.0, 20.0, 0.0),
                    new Vector3(0.0, 1.0, 0.0)
                ));
                objectsArray.forEach(element => {
                    scene.add(element.mesh)
                });*/

        const materialExtr = new MeshPhongMaterial({ color: 0xf7f7f7 });

        const loader = new THREE.FontLoader();
        //Arial_Regular
        loader.load('Cera Pro Thin_Regular.json', function (font) {

            const geometry = new THREE.TextGeometry('QWERTA', {
                font: font,
                size: 20,
                height: 1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.5,
                bevelSize: 0.2,
                bevelOffset: 0,
                bevelSegments: 8
            });

            let mesh = new Mesh(geometry, materialExtr);
            mesh.position.set(-60, 0, 0);
            mesh.scale.set(1.0, 1.1, 1.0);
            scene.add(mesh)
        });

        let shape = new Shape();
        let eps = 0.000001;
        let radius0 = 1;
        let width = 10;
        let height = 10;
        let radius = radius0 - eps;
        shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
        shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
        shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
        shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);

        const geometry2 = new THREE.ShapeGeometry(shape);
        let mesh2 = new Mesh(geometry2, materialExtr);
        //scene.add(mesh2)     

        const roundedRectShape = new THREE.Shape();
        (function roundedRect(ctx, x, y, width, height, radius) {

            ctx.moveTo(x, y + radius);
            ctx.lineTo(x, y + height - radius);
            ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
            ctx.lineTo(x + width - radius, y + height);
            ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
            ctx.lineTo(x + width, y + radius);
            ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
            ctx.lineTo(x + radius, y);
            ctx.quadraticCurveTo(x, y, x, y + radius);

        })(roundedRectShape, 0, 0, 10, 10, 5);

        // solid line

        //line.scale.set( 5, 5, 5 );
        //scene.add( line );

        roundedRectShape.autoClose = true;

        const points = roundedRectShape.getPoints();
        const spacedPoints = roundedRectShape.getSpacedPoints(50);

        const geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
        const geometrySpacedPoints = new THREE.BufferGeometry().setFromPoints(spacedPoints);

        let line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({ color: 0xf7f7f7, linewidth: 1 }));
        //scene.add( line );

        renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setClearColor(0xffffff);

        renderer.render(scene, camera);
        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('scroll', onScroll, false);

        animate();
    }
}

function onMouseMove(e) {
    let w = window.innerWidth;
    let h = window.innerHeight;
    let wk = 0.3 * (e.x - w * 0.5) / w;
    let hk = 0.3 * (e.y - h * 0.5) / h;
    objectsArray.forEach(element => {
        element.mesh.rotation.x = element.startAngle.x + hk;
        element.mesh.rotation.y = element.startAngle.y + wk;
    });
}

function onWindowResize() {
    canvas.width = document.documentElement.clientWidth;//window.innerWidth;
    canvas.height = document.documentElement.clientHeight; //window.innerHeight;
    canvas.setAttribute('width', document.documentElement.clientWidth);
    canvas.setAttribute('height', document.documentElement.clientHeight);

    camera.aspect = document.documentElement.clientWidth / document.documentElement.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(document.documentElement.clientWidth, document.documentElement.clientHeight);

    let size = document.documentElement.clientWidth < 500 ? document.documentElement.clientWidth < 400 ? 160 : 120 : 100

    objectsArray.forEach(element => {
        //element.mesh.scale.copy( new Vector3(size, size, size));
        element.mesh.position.copy(element.startPosition);
    });

    camera.position.set(0, 0, size);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onScroll(e) {
    let distanceToTop = canvas.getBoundingClientRect().top;
    let scrollMoveKoeff = -100.0 * (distanceToTop / canvas.height);
    objectsArray.forEach(element => {
        element.mesh.position.x = element.startPosition.x + element.moveDirection.x * scrollMoveKoeff;
        element.mesh.position.y = element.startPosition.y + element.moveDirection.y * scrollMoveKoeff;
        element.mesh.position.z = element.startPosition.z + element.moveDirection.z * scrollMoveKoeff;
    });
}

function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
    let shape = new Shape();
    let eps = 0.000001;
    let radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    let geometry = new ExtrudeGeometry(shape, {
        amount: depth - radius0 * 2,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius0,
        curveSegments: smoothness
    });

    geometry.center();

    return geometry;
}

export default App;

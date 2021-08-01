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
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';

//scene
let canvas, camera, scene, light, light2, renderer;
let lettersArray = [];

class Letter {
    constructor(letter, color, fSize, curveSegments, rotation, position, moveDirection) {
        this.name = letter;
        this.startAngle = rotation;
        this.startPosition = position;
        this.moveDirection = moveDirection;

        const materialExtr = new MeshPhongMaterial({ color: color });
        const fontLoader = new THREE.FontLoader();
        fontLoader.load('Cera Pro_Regular.json', function (font) {
            let geometry = new THREE.TextGeometry(letter, {
                font: font,
                size: fSize,
                height: 1.5,
                curveSegments: curveSegments,
                bevelEnabled: true,
                bevelThickness: 0.4,
                bevelSize: 0.3,
                bevelOffset: 0.0,
                bevelSegments: 10
            });
            let mesh = new Mesh(geometry, materialExtr);
            mesh.scale.set(1.0, 1.1, 1.0);
            mesh.name = letter;
            mesh.rotation.setFromVector3(rotation);
            mesh.position.copy(position);
            mesh.castShadow = true; 
            scene.add(mesh);
        });
    }
}

class App {
    init() {
        canvas = document.getElementById('main3DCanvas');
        canvas.width = document.documentElement.clientWidth;
        canvas.height = document.documentElement.clientHeight;
        canvas.setAttribute('width', window.innerWidth);
        canvas.setAttribute('height', window.innerHeight);

        //scene and camera
        scene = new Scene();
        camera = new PerspectiveCamera(40.0, canvas.width / canvas.height, 0.1, 5000);
        camera.position.set(0, 0, 100);

        //lights
        light = new PointLight(0xffffff, 0.2);
        light.position.set(0, 50, 40);
        light.castShadow = true;
        scene.add(light);
        light2 = new AmbientLight(0xffffff, 0.85);
        light2.position.set(0, 100, 100);
        scene.add(light2);

        //letters
        lettersArray.push(new Letter('Q', 0xe6e6e6, 16, 100,
            new Vector3(0.2, 0.3, 0.0), new Vector3(-12.0, 20.0, -10.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('W', 0xe6e6e6, 16, 10,
            new Vector3(0.4, -0.4, 0.0), new Vector3(4.0, 10.0, -28.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('E', 0xe6e6e6, 16, 10,
            new Vector3(0.4, -0.6, 0.0), new Vector3(18.0, 0.0, -15.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('R', 0xe6e6e6, 16, 10,
            new Vector3(-0.5, -0.6, 0.0), new Vector3(-4.0, -5.0, 0.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('T', 0xe6e6e6, 16, 10,
            new Vector3(0.1, 0.25, 0.0), new Vector3(8.0, -16.0, 5.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('A', 0xe6e6e6, 16, 10,
            new Vector3(0.2, 0.0, 0.0), new Vector3(0.0, -20.0, 10.0), new Vector3(0.0, 0.0, 0.0)
        ));

        //frame
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

        })(roundedRectShape, 0, 0, 14, 14, 1);

        const roundedRectShapePoints = roundedRectShape.getPoints();
        let FramePoints = [];
        
        roundedRectShapePoints.forEach(element => {
            FramePoints.push(element.x);
            FramePoints.push(element.y);
            FramePoints.push(0);
        });

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions( FramePoints );
        let matLine = new LineMaterial( {
            color: 0xfbfbfb,
            linewidth: .002, // in pixels
            vertexColors: false,
            dashed: false,
        } );
        let frame = new Line2(lineGeometry, matLine);
        frame.computeLineDistances();
		frame.scale.set( 1, 1, 1 );
        frame.position.set(0, 0, 10);
        //scene.add(frame);

        //plane
        const planeGeometry = new THREE.PlaneGeometry( 100, 150 );
        //const planeMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
        const planeMaterial = new THREE.ShadowMaterial();
        planeMaterial.opacity = 0.01;
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.set(-Math.PI * 30.0 / 180.0, 0.0, 0.0);
        plane.receiveShadow = true;
        scene.add( plane );
        
        renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

        renderer.render(scene, camera);
        //window.addEventListener('resize', onWindowResize, false);
        //onWindowResize();
        window.addEventListener('mousemove', onMouseMove, false);
        //window.addEventListener('scroll', onScroll, false);

        animate();
    }
}

function onMouseMove(e) {    
     let w = document.documentElement.clientWidth;
    let h = document.documentElement.clientHeight;
    let wk = 1 * (e.x - w * 0.5) / w;
    let hk = 1 * (e.y - h * 0.5) / h;
    lettersArray.forEach(element => {
        camera.position.set(10.0 * wk, 0.0 * hk, 100)
        camera.lookAt(0, 0, 0)
        scene.getObjectByName(element.name).rotation.x = element.startAngle.x + 0.2 * hk;
        scene.getObjectByName(element.name).rotation.y = element.startAngle.y + 0.3 * wk;
        scene.getObjectByName(element.name).position.z = element.startPosition.z - 3.0 * hk;
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

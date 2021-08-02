//import * as THREE from 'three';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
import { Scene } from 'three/src/scenes/Scene.js';
import { PointLight } from 'three/src/lights/PointLight.js';
import { AmbientLight } from 'three/src/lights/AmbientLight.js';
import { Vector3 } from 'three/src/math/Vector3.js';
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
import { Shape } from 'three/src/extras/core/Shape.js';
import { MeshPhongMaterial } from 'three/src/materials/MeshPhongMaterial.js';
import { Mesh } from 'three/src/objects/Mesh.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { FontLoader } from 'three/src/loaders/FontLoader.js';
import { TextGeometry } from 'three/src/geometries/TextGeometry.js';
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry.js';
import { ShadowMaterial } from 'three/src/materials/ShadowMaterial.js';

//scene
let canvas, camera, scene, light, light2, renderer;
let lettersArray = [];
let FramePoints = [];
let frames = [];

class Letter {
    constructor(letter, color, fSize, curveSegments, rotation, position, moveDirection) {
        this.name = letter;
        this.startAngle = rotation;
        this.startPosition = position;
        this.moveDirection = moveDirection;

        const materialExtr = new MeshPhongMaterial({ color: color });
        const fontLoader = new FontLoader();
        fontLoader.load('Cera Pro_Regular.json', function (font) {
            let geometry = new TextGeometry(letter, {
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

class Frame {
    constructor(name, color, width, rotation, position, moveDirection) {
        this.name = name;
        this.startAngle = rotation;
        this.startPosition = position;
        this.moveDirection = moveDirection;

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions( FramePoints );
        let matLine = new LineMaterial( {
            color: color,
            linewidth: width, // in pixels
            vertexColors: false,
            dashed: false,
        } );
        let frame = new Line2(lineGeometry, matLine);
        frame.computeLineDistances();
		frame.scale.set( 1, 1, 1 );
        frame.position.set(0, 0, 10);
        frame.name = name;
        frame.rotation.setFromVector3(rotation);
        frame.position.copy(position);
        scene.add(frame);
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
            new Vector3(0.2, 0.3, 0.0), new Vector3(-12.0, 19.0, -12.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('W', 0xe6e6e6, 16, 10,
            new Vector3(0.4, -0.4, 0.0), new Vector3(5.0, 10.0, -30.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('E', 0xe6e6e6, 16, 10,
            new Vector3(0.4, -0.6, 0.0), new Vector3(18.0, 0.0, -16.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('R', 0xe6e6e6, 16, 10,
            new Vector3(-0.5, -0.6, 0.0), new Vector3(-4.0, -5.0, -5.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('T', 0xe6e6e6, 16, 10,
            new Vector3(0.1, 0.25, 0.0), new Vector3(8.0, -16.0, 5.0), new Vector3(0.0, 0.0, 0.0)
        ));
        lettersArray.push(new Letter('A', 0xe6e6e6, 16, 10,
            new Vector3(0.2, 0.0, 0.0), new Vector3(0.0, -20.0, 10.0), new Vector3(0.0, 0.0, 0.0)
        ));

        //gen frame points
        const roundedRectShape = new Shape();
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
        
        roundedRectShapePoints.forEach(element => {
            FramePoints.push(element.x);
            FramePoints.push(element.y);
            FramePoints.push(0);
        });

        //frames
        frames.push(new Frame('frame1', 0xfafafa, 0.002, 
            new Vector3(0.3, 0.0, 0.5), new Vector3(5.0, -16.0, 0.0), new Vector3(0.0, 0.0, 0.0)
        ));
        frames.push(new Frame('frame2', 0xfafafa, 0.002, 
            new Vector3(0.0, -0.5, -0.1), new Vector3(11.0, -2.0, -8.0), new Vector3(0.0, 0.0, 0.0)
        ));
        frames.push(new Frame('frame3', 0xfafafa, 0.002, 
            new Vector3(0.0, -0.5, 0.5), new Vector3(2.0, 1.0, -12.0), new Vector3(0.0, 0.0, 0.0)
        ));        

        //plane
        const planeGeometry = new PlaneGeometry( 100, 150 );
        const planeMaterial = new ShadowMaterial();
        planeMaterial.opacity = 0.01;
        let plane = new Mesh(planeGeometry, planeMaterial);
        plane.rotation.set(-Math.PI * 30.0 / 180.0, 0.0, 0.0);
        plane.receiveShadow = true;
        scene.add( plane );
        
        renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

export default App;

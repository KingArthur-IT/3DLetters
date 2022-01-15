import * as THREE from 'three';
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

//first scene
let canvas = [], scene = [], camera = [], light = [], renderer = [], 
    cameraZPos = [90, 140];

let FramePoints = [];
//1st scene
let lettersArray = [], frames = [];
//2nd scene
let lettersArray2 = [], frames2 = [];

class Letter {
    constructor(letter, color, fSize, curveSegments, startRotation, startPosition, moveDirection, sceneIndex, 
        endPosition = null, endRotation = null, opacity = 1.0) {
        this.name = letter;
        this.startAngle = startRotation;
        this.endAngle = endRotation;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.moveDirection = moveDirection;
        this.mesh = null;

        const materialExtr = new MeshPhongMaterial({ color: color, opacity: opacity, transparent: opacity != 1.0 });
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
            let mesh = new THREE.Mesh(geometry, materialExtr);
            mesh.scale.set(1.0, 1.1, 1.0);
            mesh.name = letter;
            mesh.rotation.setFromVector3(startRotation);
            mesh.position.copy(startPosition);
            mesh.castShadow = true;
            scene[sceneIndex].add(mesh)
        });
    }
}

class Frame {
    constructor(name, color, width, startRotation, startPosition, moveDirection, sceneIndex,
        endPosition = null, endRotation = null) {
        this.name = name;
        this.startAngle = startRotation;
        this.startPosition = startPosition;
        this.endAngle = endRotation;
        this.endPosition = endPosition;
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
        frame.rotation.setFromVector3(startRotation);
        frame.position.copy(startPosition);
        scene[sceneIndex].add(frame);
    }
}

class App {
    init() {
        canvas.push(document.getElementById('main3DCanvas'), document.getElementById('scrolling3DCanvas'));
        canvas[0].setAttribute('width', 400); canvas[0].setAttribute('height', 500);
        let w = document.getElementsByClassName('canvas-wrapper')[0].offsetWidth;
        let h = document.getElementsByClassName('canvas-wrapper')[0].offsetHeight;
        canvas[1].setAttribute('width', w); canvas[1].setAttribute('height', h);
        //scene and camera
        scene.push(new Scene(), new Scene());
        camera.push(new PerspectiveCamera(40.0, canvas[0].width / canvas[0].height, 0.1, 5000), new PerspectiveCamera(40.0, canvas[1].width / canvas[1].height, 0.1, 5000));
        camera[0].position.set(10, 0, cameraZPos[0]);
        camera[1].position.set(0, 0, cameraZPos[1]);

        //lights
        light.push(new PointLight(0xffffff, 0.2), new AmbientLight(0xffffff, 0.85));
        light[0].position.set(0, 50, 40); light[0].castShadow = true;
        light[1].position.set(0, 100, 100);
        scene[0].add(light[0]); scene[0].add(light[1]);

        light.push(new PointLight(0xffffff, 0.35), new AmbientLight(0xffffff, 0.85));
        light[2].position.set(0, 50, 40); light[2].castShadow = true;
        light[3].position.set(0, 100, 100);
        scene[1].add(light[2]); scene[1].add(light[3]);

        //letters        
        createLetters();
        //frames
        createFrames();        

        //plane
        const planeGeometry = new PlaneGeometry( 100, 150 );
        const planeMaterial = new ShadowMaterial();
        planeMaterial.opacity = 0.01;
        let plane = new Mesh(planeGeometry, planeMaterial);
        plane.rotation.set(-Math.PI * 30.0 / 180.0, 0.0, 0.0);
        plane.receiveShadow = true;
        scene[0].add( plane );
        
        const planeGeometry2 = new PlaneGeometry( 100, 150 );
        let plane2 = new Mesh(planeGeometry2, planeMaterial);
        plane2.rotation.set(-Math.PI * 30.0 / 180.0, 0.0, 0.0);
        plane2.receiveShadow = true;
        scene[1].add( plane2 );
        
        renderer[0] = new WebGLRenderer({ canvas: canvas[0], antialias: true, alpha: true });
        renderer[0].setClearColor(0xffffff, 0);
        renderer[0].shadowMap.enabled = true;
        renderer[0].render(scene[0], camera[0]);
        
        renderer[1] = new WebGLRenderer({ canvas: canvas[1], antialias: true, alpha: true });
        renderer[1].setClearColor(0xffffff, 0);
        renderer[1].shadowMap.enabled = true;
        renderer[1].render(scene[1], camera[1]);


        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
        canvas[0].addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('scroll', onScroll, false);
        animate();
    }
}

function onMouseMove(e) {    
    let w = canvas[0].width;
    let h = canvas[0].height;
    let wk = 1 * (e.x - w * 0.5) / w;
    let hk = 1 * (e.y - h * 0.5) / h;
    lettersArray.forEach(element => {
        camera[0].position.set(10 + 2.0 * wk, 0.0 * hk, cameraZPos[0])
        scene[0].getObjectByName(element.name).rotation.x = element.startAngle.x + 0.2 * hk;
        scene[0].getObjectByName(element.name).rotation.y = element.startAngle.y + 0.3 * wk;
        scene[0].getObjectByName(element.name).position.z = element.startPosition.z - 3.0 * hk;
    });
}

function onWindowResize() {
    let w = document.getElementsByClassName('canvas-wrapper')[0].offsetWidth;
    let h = document.getElementsByClassName('canvas-wrapper')[0].offsetHeight;
    canvas[1].setAttribute('width', w); canvas[1].setAttribute('height', h);

    camera[1].aspect = w / h;
    camera[1].updateProjectionMatrix();

    renderer[1].setSize(w, h);   
}

function animate() {
    requestAnimationFrame(animate);
    renderer[0].render(scene[0], camera[0]);
    renderer[1].render(scene[1], camera[1]);
}

function createLetters(){
    //1st scene
    lettersArray.push(new Letter('Q', 0xe6e6e6, 16, 100,
        new Vector3(0.2, 0.3, 0.0), new Vector3(-12.0, 19.0, -12.0), new Vector3(0.0, 0.0, 0.0), 0, null, null, 0.5 
    )); 
    lettersArray.push(new Letter('W', 0xe6e6e6, 16, 10,
        new Vector3(0.4, -0.4, 0.0), new Vector3(5.0, 10.0, -30.0), new Vector3(0.0, 0.0, 0.0), 0 
    )); 
    lettersArray.push(new Letter('E', 0xe6e6e6, 16, 10,
        new Vector3(0.4, -0.6, 0.0), new Vector3(18.0, 0.0, -16.0), new Vector3(0.0, 0.0, 0.0), 0 
    )); 
    lettersArray.push(new Letter('R', 0xe6e6e6, 16, 10,
        new Vector3(-0.5, -0.6, 0.0), new Vector3(-4.0, -5.0, -5.0), new Vector3(0.0, 0.0, 0.0), 0 
    ));
    lettersArray.push(new Letter('T', 0xe6e6e6, 16, 10,
        new Vector3(0.1, 0.25, 0.0), new Vector3(8.0, -16.0, 5.0), new Vector3(0.0, 0.0, 0.0), 0 
    ));
    lettersArray.push(new Letter('A', 0xe6e6e6, 16, 10,
        new Vector3(0.2, 0.0, 0.0), new Vector3(0.0, -20.0, 10.0), new Vector3(0.0, 0.0, 0.0), 0 
    )); 

    //2ns scene
    lettersArray2.push(new Letter('Q', 0xe6e6e6, 16, 100,
        new Vector3(-0.15, 0.0, -0.3), new Vector3(-64.0, 37.0, -12.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(-12.0, -3.0, -12.0), new Vector3(0.2, 0.3, 0.0)
    )); 
    lettersArray2.push(new Letter('W', 0xe6e6e6, 16, 10,
        new Vector3(0.4, -0.4, 0.0), new Vector3(15.0, 40.0, -30.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(5.0, -12.0, -30.0), new Vector3(0.4, -0.4, 0.0)
    )); 
    lettersArray2.push(new Letter('E', 0xe6e6e6, 16, 10,
        new Vector3(0.84, -0.7, 0.21), new Vector3(55.0, 18.0, -16.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(18.0, -22.0, -16.0), new Vector3(0.4, -0.6, 0.0)
    )); 
    lettersArray2.push(new Letter('R', 0xe6e6e6, 16, 10,
        new Vector3(-0.42, -0.3, 0.12), new Vector3(-45.0, 2.0, -5.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(-4.0, -27.0, -5.0), new Vector3(-0.5, -0.6, 0.0)
    ));
    lettersArray2.push(new Letter('T', 0xe6e6e6, 16, 10,
        new Vector3(0.1, 0.22, 0.0), new Vector3(30.0, -20.0, 5.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(8.0, -38.0, 5.0), new Vector3(0.1, 0.25, 0.0)
    ));
    lettersArray2.push(new Letter('A', 0xe6e6e6, 16, 10,
        new Vector3(0.0, 0.25, -0.05), new Vector3(-55.0, -20.0, 10.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(0.0, -42.0, 10.0), new Vector3(0.2, 0.0, 0.0)
    )); 
}

function createFrames(){
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

    //1st scene
    frames.push(new Frame('frame1', 0xfafafa, 0.002, 
        new Vector3(0.3, 0.0, 0.5), new Vector3(5.0, -16.0, 0.0), new Vector3(0.0, 0.0, 0.0), 0
    ));
    frames.push(new Frame('frame2', 0xfafafa, 0.002, 
        new Vector3(0.0, -0.5, -0.1), new Vector3(11.0, -2.0, -8.0), new Vector3(0.0, 0.0, 0.0), 0
    ));
    frames.push(new Frame('frame3', 0xfafafa, 0.002, 
        new Vector3(0.0, -0.5, 0.5), new Vector3(2.0, 1.0, -12.0), new Vector3(0.0, 0.0, 0.0), 0
    )); 

    //2nd scene
    frames2.push(new Frame('frame1', 0xfafafa, 0.002, 
        new Vector3(0.3, 0.0, 0.5), new Vector3(5.0, -38.0, 0.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(-25.0, 30.0, 0.0), new Vector3(0.3, 0.0, 0.5)
    ));
    frames2.push(new Frame('frame2', 0xfafafa, 0.002, 
        new Vector3(0.0, -0.5, -0.1), new Vector3(11.0, -24.0, -8.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(60.0, 0.0, -8.0), new Vector3(0.0, -0.5, -0.1)
    ));
    frames2.push(new Frame('frame3', 0xfafafa, 0.002, 
        new Vector3(0.0, -0.5, 0.5), new Vector3(2.0, -21.0, -12.0), new Vector3(0.0, 0.0, 0.0), 1,
        new Vector3(-60.0, -10.0, -12.0), new Vector3(0.0, -0.5, 0.5)
    )); 
}

function onScroll(){
    let top = document.getElementsByClassName('canvas-wrapper')[0].getBoundingClientRect().top;
    let height = document.getElementsByClassName('canvas-wrapper')[0].offsetHeight;
    if (top < height * 0.5 && top > 0){
        moveLetters(Math.abs(top) / (0.5 * height));
    }
}

function moveLetters(k){
    lettersArray2.forEach(element => {
        scene[1].getObjectByName(element.name).position.x = element.endPosition.x + (element.startPosition.x - element.endPosition.x) * k;
        scene[1].getObjectByName(element.name).position.y = element.endPosition.y + (element.startPosition.y - element.endPosition.y) * k;
        scene[1].getObjectByName(element.name).position.z = element.endPosition.z + (element.startPosition.z - element.endPosition.z) * k;
        scene[1].getObjectByName(element.name).rotation.x = element.endAngle.x + (element.startAngle.x - element.endAngle.x) * k;
        scene[1].getObjectByName(element.name).rotation.y = element.endAngle.y + (element.startAngle.y - element.endAngle.y) * k;
        scene[1].getObjectByName(element.name).rotation.z = element.endAngle.z + (element.startAngle.z - element.endAngle.z) * k;
    });

    frames2.forEach(element => {
        scene[1].getObjectByName(element.name).position.x = element.startPosition.x + (element.endPosition.x - element.startPosition.x) * k;
        scene[1].getObjectByName(element.name).position.y = element.startPosition.y + (element.endPosition.y - element.startPosition.y) * k;
        scene[1].getObjectByName(element.name).position.z = element.startPosition.z + (element.endPosition.z - element.startPosition.z) * k;
        scene[1].getObjectByName(element.name).rotation.x = element.startAngle.x + (element.endAngle.x - element.startAngle.x) * k;
        scene[1].getObjectByName(element.name).rotation.y = element.startAngle.y + (element.endAngle.y - element.startAngle.y) * k;
        scene[1].getObjectByName(element.name).rotation.z = element.startAngle.z + (element.endAngle.z - element.startAngle.z) * k;
    });
}

export default App;

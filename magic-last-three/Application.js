
/**
 * @description
 * Main instance
 */

import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {PointerLockControls} from 'three/addons/controls/PointerLockControls.js';
import {ConvexObjectBreaker} from "three/addons/misc/ConvexObjectBreaker.js";
import {ConvexGeometry} from "three/addons/geometries/ConvexGeometry.js";
import {createRandomColor, getDom} from "./public/libs/utils";
import {createFPSController} from "./public/magic/controllers";
import config from './config';
import {initPhysics} from "./public/magic/physics";

class Application {

  // Graphics variables
  container = getDom("container");
  stats = null;

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
  scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  controls = null;
  textureLoader = null;
  clock = new THREE.Clock();
  mouseCoords = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  ballMaterial = new THREE.MeshPhongMaterial({color: 0x202020});

  // FPShooter Controller
  moveForward = false;
  moveBackward = false;
  moveLeft = false;
  moveRight = false;
  canJump = false;

  prevTime = performance.now();
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();
  vertex = new THREE.Vector3();
  color = new THREE.Color();

  // Physics variables
  gravityConstant = 7.8;
  collisionConfiguration;
  dispatcher;
  broadphase;
  solver;
  physicsWorld;
  margin = 0.05;

  convexBreaker = new ConvexObjectBreaker();

  // Rigid bodies include all movable objects
  rigidBodies = [];
  pos = new THREE.Vector3();
  quat = new THREE.Quaternion();
  transformAux1;
  tempBtVec3_1;
  objectsToRemove = [];

  // Player
  ammoTmpPos;
  ammoTmpQuat;
  tmpTrans;

  // kinekt type of movement
  kMoveDirection = {left: 0, right: 0, forward: 0, back: 0};
  // velocity type of movement
  moveDirection = {left: 0, right: 0, forward: 0, back: 0};

  tmpPos = new THREE.Vector3();
  tmpQuat = new THREE.Quaternion();

  config;

  constructor(config) {
    for(let i = 0;i < 500;i++) {
      this.objectsToRemove[i] = null;
    }

    this.config = config;
    console.log('Running under config', config);

    Ammo().then((AmmoLib) => {

      Ammo = AmmoLib;

      this.ammoTmpPos = new Ammo.btVector3();
      this.ammoTmpQuat = new Ammo.btQuaternion();
      this.tmpTrans = new Ammo.btTransform();

      this.init();
      this.animate();
      console.log('Ammo is ready! 100');
    })
  }

  numObjectsToRemove = 0;
  impactPoint = new THREE.Vector3();
  impactNormal = new THREE.Vector3();

  playerBody;

  init() {

    this.initPhysics = initPhysics.bind(this);
    this.moveVelocity = moveVelocity.bind(this);
    this.createFPSController = createFPSController.bind(this);

    this.initGraphics();
    this.initPhysics();
    this.createObjects();
    this.initInput();

    this.createPlayer();
  }

  initGraphics() {

    // this.container = document.getElementById("container");
    this.scene.background = new THREE.Color(0xbfd1e5);

    this.camera.position.set(
      this.config.playerController.cameraInitPosition.x,
      this.config.playerController.cameraInitPosition.y,
      this.config.playerController.cameraInitPosition.z);

    // this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    if(this.config.playerController.type === 'FPS') {
      this.createFPSController();
    } else {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.target.set(0, 2, 0);
      this.controls.update();
    }

    this.textureLoader = new THREE.TextureLoader();

    this.ambientLight = new THREE.AmbientLight(0x707070);
    this.scene.add(this.ambientLight);

    this.light = new THREE.DirectionalLight(0xffffff, 1);
    this.light.position.set(-10, 18, 5);
    this.light.castShadow = true;
    const d = 14;
    this.light.shadow.camera.left = -d;
    this.light.shadow.camera.right = d;
    this.light.shadow.camera.top = d;
    this.light.shadow.camera.bottom = -d;
    this.light.shadow.camera.near = 2;
    this.light.shadow.camera.far = 50;
    this.light.shadow.mapSize.x = 1024;
    this.light.shadow.mapSize.y = 1024;
    this.scene.add(this.light);

    this.stats = new Stats();
    this.stats.domElement.style.position = "absolute";
    this.stats.domElement.style.top = "0px";
    this.container.appendChild(this.stats.domElement);

    window.addEventListener("resize", this.onWindowResize);
  }

  createObject(mass, halfExtents, pos, quat, material) {
    const object = new THREE.Mesh(
      new THREE.BoxGeometry(
        halfExtents.x * 2,
        halfExtents.y * 2,
        halfExtents.z * 2
      ),
      material
    );
    object.position.copy(pos);
    object.quaternion.copy(quat);
    this.convexBreaker.prepareBreakableObject(
      object,
      mass,
      new THREE.Vector3(),
      new THREE.Vector3(),
      true
    );
    this.createDebrisFromBreakableObject(object);
  }

  createPlayer() {
    const material = new THREE.LineBasicMaterial({color: 0x0000ff});
    const ballMass = 35;
    const ballRadius = 2;
    const ball = new THREE.Line(
      new THREE.SphereGeometry(ballRadius, 14, 10),
      material);
    // const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    const ballShape = new Ammo.btSphereShape(ballRadius);
    ballShape.setMargin(this.margin);
    this.pos.copy(this.raycaster.ray.direction);
    this.pos.add(this.raycaster.ray.origin);
    this.quat.set(0, 0, 0, 1);
    this.playerBody = ball;

    // let localInertia = new Ammo.btVector3(0, 0, 0);
    // ballShape.calculateLocalInertia(10, localInertia);
    const playerB = this.createRigidBody(
      ball,
      ballShape,
      ballMass,
      this.pos,
      this.quat
    );
    console.log("PlayerBody created. ", this.playerBody)
    playerB.setCollisionFlags(0);
  }

  moveKinematic() {
    let scalingFactor = 0.3;
    let moveX = this.kMoveDirection.right - this.kMoveDirection.left;
    let moveZ = this.kMoveDirection.back - this.kMoveDirection.forward;
    let moveY = 0;
    let translateFactor = this.tmpPos.set(moveX, moveY, moveZ);
    translateFactor.multiplyScalar(scalingFactor);
    this.playerBody.translateX(translateFactor.x);
    this.playerBody.translateY(translateFactor.y);
    this.playerBody.translateZ(translateFactor.z);
    this.playerBody.getWorldPosition(this.tmpPos);
    this.playerBody.getWorldQuaternion(this.tmpQuat);
    let physicsBody = this.playerBody.userData.physicsBody;
    let ms = physicsBody.getMotionState();
    if(ms) {
      this.ammoTmpPos.setValue(this.tmpPos.x, this.tmpPos.y, this.tmpPos.z);
      this.ammoTmpQuat.setValue(this.tmpQuat.x, this.tmpQuat.y, this.tmpQuat.z, this.tmpQuat.w);
      this.tmpTrans.setIdentity();
      this.tmpTrans.setOrigin(this.ammoTmpPos);
      this.tmpTrans.setRotation(this.ammoTmpQuat);
      ms.setWorldTransform(this.tmpTrans);
    }
  }

  createObjectStatic(mass, halfExtents, pos, quat, material) {
    const object = new THREE.Mesh(
      new THREE.BoxGeometry(
        halfExtents.x * 2,
        halfExtents.y * 2,
        halfExtents.z * 2
      ),
      material
    );
    object.position.copy(pos);
    object.quaternion.copy(quat);
    // this.convexBreaker.prepareBreakableObject(
    //   object,
    //   mass,
    //   new THREE.Vector3(),
    //   new THREE.Vector3(),
    //   true
    // );
    // this.createDebrisFromBreakableObject(object);
  }

  createObjects() {
    // Ground
    this.pos.set(0, -0.5, 0);
    this.quat.set(0, 0, 0, 1);
    const ground = this.createParalellepipedWithPhysics(40, 1, 40, 0, this.pos, this.quat,
      new THREE.MeshPhongMaterial({color: 0xffffff})
    );
    ground.receiveShadow = true;
    this.textureLoader.load("./assets/textures/cube/crate.gif", function(texture) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(40, 40);
      ground.material.map = texture;
      ground.material.needsUpdate = true;
    });

    // Tower 1 Breakable
    const towerMass = 1000;
    const towerHalfExtents = new THREE.Vector3(2, 5, 2);
    this.pos.set(-8, 5, 0);
    this.quat.set(0, 0, 0, 1);
    this.createObject(
      towerMass,
      towerHalfExtents,
      this.pos,
      this.quat,
      this.createMaterial(0xb03014)
    );

    // Tower 2 Normal
    this.pos.set(8, 5, 0);
    this.quat.set(0, 0, 0, 1);
    this.createObject(
      towerMass,
      towerHalfExtents,
      this.pos,
      this.quat,
      this.createMaterial(0xb03214)
    );

  }

  createParalellepipedWithPhysics(sx, sy, sz, mass, pos, quat, material) {
    const object = new THREE.Mesh(
      new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
      material
    );
    const shape = new Ammo.btBoxShape(
      new Ammo.btVector3(sx * 0.5, sy * 0.5, sz * 0.5)
    );
    shape.setMargin(this.margin);
    this.createRigidBody(object, shape, mass, pos, quat);
    return object;
  }

  createDebrisFromBreakableObject(object) {
    object.castShadow = true;
    object.receiveShadow = true;

    const shape = this.createConvexHullPhysicsShape(
      object.geometry.attributes.position.array
    );
    shape.setMargin(this.margin);

    const body = this.createRigidBody(
      object,
      shape,
      object.userData.mass,
      null,
      null,
      object.userData.velocity,
      object.userData.angularVelocity
    );

    // Set pointer back to the three object only in the debris objects
    const btVecUserData = new Ammo.btVector3(0, 0, 0);
    btVecUserData.threeObject = object;
    body.setUserPointer(btVecUserData);
  }

  removeDebris(object) {
    this.scene.remove(object);
    this.physicsWorld.removeRigidBody(object.userData.physicsBody);
  }

  createConvexHullPhysicsShape(coords) {
    const shape = new Ammo.btConvexHullShape();

    for(let i = 0, il = coords.length;i < il;i += 3) {
      this.tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2]);
      const lastOne = i >= il - 3;
      shape.addPoint(this.tempBtVec3_1, lastOne);
    }

    return shape;
  }

  createRigidBody(object, physicsShape, mass, pos, quat, vel, angVel) {
    if(pos) {
      object.position.copy(pos);
    } else {
      pos = object.position;
    }

    if(quat) {
      object.quaternion.copy(quat);
    } else {
      quat = object.quaternion;
    }

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(
      new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      physicsShape,
      localInertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

    body.setFriction(0.5);

    if(vel) {
      body.setLinearVelocity(new Ammo.btVector3(vel.x, vel.y, vel.z));
    }

    if(angVel) {
      body.setAngularVelocity(
        new Ammo.btVector3(angVel.x, angVel.y, angVel.z)
      );
    }
    object.userData.physicsBody = body;
    object.userData.collided = false;
    this.scene.add(object);

    if(mass > 0) {
      this.rigidBodies.push(object);
      // Disable deactivation
      body.setActivationState(4);
    }

    this.physicsWorld.addRigidBody(body);
    return body;
  }

  createMaterial(color) {
    color = color || createRandomColor();
    return new THREE.MeshPhongMaterial({color: color});
  }

  initInput() {
    window.addEventListener("pointerdown", (event) => {
      this.mouseCoords.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(this.mouseCoords, this.camera);

      // Creates a ball and throws it
      const ballMass = 35;
      const ballRadius = 0.4;
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(ballRadius, 14, 10),
        this.ballMaterial
      );
      ball.castShadow = true;
      ball.receiveShadow = true;
      const ballShape = new Ammo.btSphereShape(ballRadius);
      ballShape.setMargin(this.margin);
      this.pos.copy(this.raycaster.ray.direction);
      this.pos.add(this.raycaster.ray.origin);
      this.quat.set(0, 0, 0, 1);
      const ballBody = this.createRigidBody(
        ball,
        ballShape,
        ballMass,
        this.pos,
        this.quat
      );

      this.pos.copy(this.raycaster.ray.direction);
      this.pos.multiplyScalar(24);
      ballBody.setLinearVelocity(new Ammo.btVector3(this.pos.x, this.pos.y, this.pos.z));
    });
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.render();
    this.stats.update();
  }

  render() {
    const deltaTime = this.clock.getDelta();

    this.updatePhysics(deltaTime);
    this.updateControls();

    if(this.config.playerController.movementType === 'velocity') {
      this.moveVelocity();
    } else {
      this.moveKinematic();
    }

    this.renderer.render(this.scene, this.camera);
  }

  updatePhysics(deltaTime) {
    // Step world
    this.physicsWorld.stepSimulation(deltaTime, 10);

    /// nidza test
    // this.playerBody

    // Update rigid bodies
    for(let i = 0, il = this.rigidBodies.length;i < il;i++) {
      const objThree = this.rigidBodies[i];
      const objPhys = objThree.userData.physicsBody;
      const ms = objPhys.getMotionState();

      if(ms) {
        ms.getWorldTransform(this.transformAux1);
        const p = this.transformAux1.getOrigin();
        const q = this.transformAux1.getRotation();
        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

        objThree.userData.collided = false;
      }
    }

    for(let i = 0, il = this.dispatcher.getNumManifolds();i < il;i++) {
      const contactManifold = this.dispatcher.getManifoldByIndexInternal(i);
      const rb0 = Ammo.castObject(
        contactManifold.getBody0(),
        Ammo.btRigidBody
      );
      const rb1 = Ammo.castObject(
        contactManifold.getBody1(),
        Ammo.btRigidBody
      );

      const threeObject0 = Ammo.castObject(
        rb0.getUserPointer(),
        Ammo.btVector3
      ).threeObject;
      const threeObject1 = Ammo.castObject(
        rb1.getUserPointer(),
        Ammo.btVector3
      ).threeObject;

      if(!threeObject0 && !threeObject1) {
        continue;
      }

      const userData0 = threeObject0 ? threeObject0.userData : null;
      const userData1 = threeObject1 ? threeObject1.userData : null;

      const breakable0 = userData0 ? userData0.breakable : false;
      const breakable1 = userData1 ? userData1.breakable : false;

      const collided0 = userData0 ? userData0.collided : false;
      const collided1 = userData1 ? userData1.collided : false;

      if((!breakable0 && !breakable1) || (collided0 && collided1)) {
        continue;
      }

      let contact = false;
      let maxImpulse = 0;
      for(let j = 0, jl = contactManifold.getNumContacts();j < jl;j++) {
        const contactPoint = contactManifold.getContactPoint(j);

        if(contactPoint.getDistance() < 0) {
          contact = true;
          const impulse = contactPoint.getAppliedImpulse();

          if(impulse > maxImpulse) {
            maxImpulse = impulse;
            const pos = contactPoint.get_m_positionWorldOnB();
            const normal = contactPoint.get_m_normalWorldOnB();
            this.impactPoint.set(pos.x(), pos.y(), pos.z());
            this.impactNormal.set(normal.x(), normal.y(), normal.z());
          }

          break;
        }
      }

      // If no point has contact, abort
      if(!contact) continue;
      // Subdivision
      const fractureImpulse = 250;

      if(breakable0 && !collided0 && maxImpulse > fractureImpulse) {
        const debris = this.convexBreaker.subdivideByImpact(
          threeObject0,
          this.impactPoint,
          this.impactNormal,
          1,
          2,
          1.5
        );

        const numObjects = debris.length;
        for(let j = 0;j < numObjects;j++) {
          const vel = rb0.getLinearVelocity();
          const angVel = rb0.getAngularVelocity();
          const fragment = debris[j];
          fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
          fragment.userData.angularVelocity.set(
            angVel.x(),
            angVel.y(),
            angVel.z()
          );
          this.createDebrisFromBreakableObject(fragment);
        }

        this.objectsToRemove[this.numObjectsToRemove++] = threeObject0;
        userData0.collided = true;
      }

      if(breakable1 && !collided1 && maxImpulse > fractureImpulse) {
        const debris = this.convexBreaker.subdivideByImpact(
          threeObject1,
          this.impactPoint,
          this.impactNormal,
          1,
          2,
          1.5
        );

        const numObjects = debris.length;
        for(let j = 0;j < numObjects;j++) {
          const vel = rb1.getLinearVelocity();
          const angVel = rb1.getAngularVelocity();
          const fragment = debris[j];
          fragment.userData.velocity.set(vel.x(), vel.y(), vel.z());
          fragment.userData.angularVelocity.set(
            angVel.x(),
            angVel.y(),
            angVel.z()
          );

          this.createDebrisFromBreakableObject(fragment);
        }

        this.objectsToRemove[this.numObjectsToRemove++] = threeObject1;
        userData1.collided = true;
      }
    }

    for(let i = 0;i < this.numObjectsToRemove;i++) {
      this.removeDebris(this.objectsToRemove[i]);
    }
    this.numObjectsToRemove = 0;
  }

  updateControls() {
    const time = performance.now();
    // this.camera.position.copy(this.playerBody.position);
    // this.camera.quaternion.copy(this.playerBody.quaternion);
    if(this.controls.isLocked === true) {
      this.raycaster.ray.origin.copy(this.controls.getObject().position);
      this.raycaster.ray.origin.y -= 5;
      const intersections = this.raycaster.intersectObjects(this.scene.children, false);
      const onObject = intersections.length > 0;
      const delta = (time - this.prevTime) / 1000;
      this.velocity.x -= this.velocity.x * 10.0 * delta;
      this.velocity.z -= this.velocity.z * 10.0 * delta;
      this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
      this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
      this.direction.x = Number(this.moveRight) - Number(this.moveLeft);
      this.direction.normalize(); // this ensures consistent movements in all directions
      if(this.moveForward || this.moveBackward) this.velocity.z -= this.direction.z * 400.0 * delta;
      if(this.moveLeft || this.moveRight) this.velocity.x -= this.direction.x * 400.0 * delta;
      if(onObject === true) {
        this.velocity.y = Math.max(0, this.velocity.y);
        this.canJump = true;
      }

      this.controls.moveRight(- this.velocity.x * delta);
      this.controls.moveForward(- this.velocity.z * delta);

      this.playerBody.position.copy(this.camera.position);

      this.controls.getObject().position.y += (this.velocity.y * delta); // new behavior

      if(this.controls.getObject().position.y < 5) {
        this.velocity.y = 0;
        this.controls.getObject().position.y = 5;
        this.canJump = true;
      }

      // console.log('this.controls.', this.camera.position)
    }
    this.prevTime = time;
  }
}

let App = new Application(config);

window.App = App;

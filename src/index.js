import CANNON from './cannon'

export class DeYanPhysics {
  constructor(worldObjects) {
    this.ShapeTypes = {
      SPHERE: 1,
      PLANE: 2,
      BOX: 4,
      COMPOUND: 8,
      CONVEXPOLYHEDRON: 16,
      HEIGHTFIELD: 32,
      PARTICLE: 64,
      CYLINDER: 128,
      TRIMESH: 256
    }

    this.fixedTimeStep = 1.0 / 30.0 // seconds
    this.maxSubSteps = 3

    this.groundMaterial = new CANNON.Material()

    this.worldObjects = worldObjects

    this.world = new CANNON.World()

    this.CANNON = CANNON

    this.world.gravity.set(0, -29.82, 0) // m/s²

    this.worldObjects.forEach((worldObject, i) => {
      this.world.addBody(worldObject.physicsObject)
      worldObject.transform = worldObject.sceneObject.getTransform()
      this.syncScale(this.worldObjects[i].transform, this.worldObjects[i].physicsObject)

    })
  }

  bodyPos(cannonBody) {
    return new vec3(cannonBody.position.x, cannonBody.position.y, cannonBody.position.z)
  }


  bodyScale(cannonBody) {
    const shape = cannonBody.shapes[0]


    switch (shape.type) {
      case this.ShapeTypes.SPHERE:
        return new vec3(shape.radius, shape.radius, shape.radius)
        break
      case this.ShapeTypes.PLANE:
        return new vec3(10, 10, 10)
        break

      case this.ShapeTypes.BOX:
      default:
        const size = shape.halfExtents
        return new vec3(size.x / 8, size.y / 8, size.z / 8)
        break
    }
  }

  bodyRot(cannonBody) {
    var rot = cannonBody.quaternion
    transform.setWorldRotation(new quat(rot.w, rot.x, rot.y, rot.z))
  }

  addWorldObject(worldObject) {
    this.world.addBody(worldObject.physicsObject)

    worldObject.transform = worldObject.sceneObject.getTransform()

    this.worldObjects.push(worldObject)

    this.syncScale(worldObject.transform, worldObject.physicsObject)
  }

  syncPos(transform, cannonBody) {
    var newPos = this.bodyPos(cannonBody)
    transform.setWorldPosition(newPos)

    var rot = cannonBody.quaternion
    transform.setWorldRotation(new quat(rot.w, rot.x, rot.y, rot.z))
  }

  syncScale(transform, cannonBody) {
    const physicsSize = this.bodyScale(cannonBody)
    transform.setWorldScale(physicsSize)
  }

  update() {
    this.world.step(global.getDeltaTime())
    for (var i = 0; i < this.worldObjects.length; i++) {
      this.syncPos(this.worldObjects[i].transform, this.worldObjects[i].physicsObject)
    }
  }


  syncSceneObject(transform, cannonBody) {
    var pos = transform.getWorldPosition()
    var rot = transform.getWorldRotation()

    //Added support for changing the scale too
    cannonBody.position.set(pos.x, pos.y, pos.z)
    cannonBody.quaternion.set(rot.x, rot.z, rot.y, rot.w)
    cannonBody.velocity = new CANNON.Vec3(0, 0, 0)
    cannonBody.torque = new CANNON.Vec3(0, 0, 0)
  }

  static makeBox(size, position, rotation) {
    var mat = new CANNON.Material()

    return new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z)),
      quaternion: new CANNON.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w || 0.5),
      material: mat
    })
  }

  static makeSphere(size, position, rotation) {
    var mat = new CANNON.Material()
    return new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(position.x, position.y, position.z),
      shape: new CANNON.Sphere(size.x),
      material: mat
    })
  }

  static makeFloor(size, position, rotation) {
    var mat = new CANNON.Material()
    const groundShape = new CANNON.Box(new CANNON.Vec3(1000, 1000, 1))
    var groundBody = new CANNON.Body({
      mass: 0, // mass == 0 makes the body static
      material: mat,
      shape: groundShape
    })
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    return groundBody
  }
}

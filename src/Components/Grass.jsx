import { useFrame, useLoader } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import * as THREE from 'three'

import grassFragmentShader from '../shaders/grass/grass-fragment-shader.glsl'
import grassVertexShader from '../shaders/grass/grass-vertex-shader.glsl'

import groundFragmentShader from '../shaders/terrain/ground-fragment-shader.glsl'
import groundVertexShader from '../shaders/terrain/ground-vertex-shader.glsl'


const NUM_GRASS = 64 * (2 ** 6)
const GRASS_SEGMENTS = 3
const GRASS_PATCH_SIZE = 10
const GRASS_WIDTH = 0.1
const GRASS_HEIGHT = 2

const GRID_SIZE = 20
const SPACING = GRASS_PATCH_SIZE * 2

const MAX_DIST = 160
const MAX_DIST_SQ = MAX_DIST * MAX_DIST

export default function Grass(){

    /**
     * Grass
     */

    //Create grass geometry
    const grassGeometry = useMemo(() => {
        return CreateGeometry(GRASS_SEGMENTS)
    }, [GRASS_SEGMENTS])
    
    //Grass uniforms
    const uniforms = {
        grassParams: new THREE.Uniform(
            new THREE.Vector4(
                GRASS_SEGMENTS,
                GRASS_PATCH_SIZE,
                GRASS_WIDTH,
                GRASS_HEIGHT
            )
        ),
        grassDiffuse: new THREE.Uniform(null),               //Mirar aquestes dues perque igual mos conve fer-ho aixi sense tiledatatexture
        time: new THREE.Uniform(0),
        resolution: new THREE.Uniform(new THREE.Vector2(1, 1))
    }

    //Different types of grass blades
    const diffuse = new TextureAtlas()
    diffuse.Load('diffuse', [
        './textures/grass1.png',
        './textures/grass2.png'
    ])
    diffuse.onLoad = () => {
        uniforms.grassDiffuse = new THREE.Uniform(diffuse.Info['diffuse'].atlas)
    }

    //Create material
    const grassMaterial = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: grassVertexShader,
        fragmentShader: grassFragmentShader,
        side: THREE.FrontSide
    })

    /**
     * Ground
     */
    //Create material
    const groundMaterial = new THREE.ShaderMaterial({
        uniforms: {
            resolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
        },
        vertexShader: groundVertexShader,
        fragmentShader: groundFragmentShader,
    })

    //Create geometry
    const groundGeometry = new THREE.PlaneGeometry(1, 1, 512, 512)

    /**
     * Complete tiles (With world pos)
     */
    const grassTiles = useMemo(() => {
        const tiles = []

        const forwardBias = GRID_SIZE * 2.5
        const sideRange = GRID_SIZE

        for(let i = -sideRange; i <= sideRange; i++){
            for(let j = -GRID_SIZE; j <= forwardBias; j++){
                const forwardOffset = new THREE.Vector3(0, 0, j * SPACING)
                const sideOffset = new THREE.Vector3(i * SPACING, 0, 0)

                const pos = forwardOffset.add(sideOffset)
                pos.y = 0

                tiles.push(pos)
            }
        }

        return tiles
    }, [])

    const grassRefs = useRef([])
    const groundRefs = useRef([])

    //Avoid rendering not visible grass tiles
    useFrame((state) => {
        const camPos = state.camera.position

        grassMaterial.uniforms.time.value = state.clock.elapsedTime

        for (let i = 0; i < grassTiles.length; i++) {
            const tilePos = grassTiles[i]

            const distSq = tilePos.distanceToSquared(camPos)
            const isVisible = distSq < MAX_DIST_SQ

            if (grassRefs.current[i]) {
                grassRefs.current[i].visible = isVisible
            }

            if (groundRefs.current[i]) {
                groundRefs.current[i].visible = isVisible
            }
        }
    })

    return <>
        {grassTiles.map((pos, i) => (
            <group key={i}>
                {/* Grass */}
                <mesh
                    ref={(el) => (grassRefs.current[i] = el)}
                    geometry={grassGeometry}
                    material={grassMaterial}
                    position={[pos.x, pos.y, pos.z]}
                    frustumCulled={true}
                />

                {/* Ground */}
                <mesh
                    ref={(el) => (groundRefs.current[i] = el)}
                    geometry={groundGeometry}
                    material={groundMaterial}
                    position={[pos.x, pos.y, pos.z]}
                    rotation-x={-Math.PI / 2}
                    scale={20}
                    frustumCulled={true}
                />
            </group>
      ))}
    </>
}

function CreateGeometry(segments) {
    const VERTICES = (segments + 1) * 2;
    const indices = [];

    for (let i = 0; i < segments; ++i) {
        const vi = i * 2;
        indices[i*12+0] = vi + 0;
        indices[i*12+1] = vi + 1;
        indices[i*12+2] = vi + 2;

        indices[i*12+3] = vi + 2;
        indices[i*12+4] = vi + 1;
        indices[i*12+5] = vi + 3;

        const fi = VERTICES + vi;
        indices[i*12+6] = fi + 2;
        indices[i*12+7] = fi + 1;
        indices[i*12+8] = fi + 0;

        indices[i*12+9] = fi + 3;
        indices[i*12+10] = fi + 1;
        indices[i*12+11] = fi + 2;
    }

    const geo = new THREE.InstancedBufferGeometry();
    geo.instanceCount = NUM_GRASS;
    geo.setIndex(indices);
    geo.boundingSphere = new THREE.Sphere(
        new THREE.Vector3(0, 0, 0),
        5 + GRASS_PATCH_SIZE * 4
    );

    return geo;
}

//Taken from https://github.com/mrdoob/three.js/issues/758
function _GetImageData(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context.translate(0, image.height);
  context.scale(1, -1);
  context.drawImage(image, 0, 0);

  return context.getImageData( 0, 0, image.width, image.height );
}

//Taken from Simondev
class TextureAtlas {
    constructor() {
        this.create_();
        this.onLoad = () => {};
    }

    Load(atlas, names) {
        this.loadAtlas_(atlas, names);
    }

    create_() {
        this.manager_ = new THREE.LoadingManager();
        this.loader_ = new THREE.TextureLoader(this.manager_);
        this.textures_ = {};

        this.manager_.onLoad = () => {
        this.onLoad_();
        };
    }

    get Info() {
        return this.textures_;
    }

    onLoad_() {
        for (let k in this.textures_) {
            let X = null;
            let Y = null;
            const atlas = this.textures_[k];
            let data = null;

            for (let t = 0; t < atlas.textures.length; t++) {
                const loader = atlas.textures[t];
                const curData = loader();

                const h = curData.height;
                const w = curData.width;

                if (X === null) {
                    X = w;
                    Y = h;
                    data = new Uint8Array(atlas.textures.length * 4 * X * Y);
                }

                if (w !== X || h !== Y) {
                    console.error('Texture dimensions do not match');
                    return;
                }
                const offset = t * (4 * w * h);

                data.set(curData.data, offset);
            }

            const diffuse = new THREE.DataArrayTexture(data, X, Y, atlas.textures.length);
            diffuse.format = THREE.RGBAFormat;
            diffuse.type = THREE.UnsignedByteType;
            diffuse.minFilter = THREE.LinearMipMapLinearFilter;
            diffuse.magFilter = THREE.LinearFilter;
            diffuse.wrapS = THREE.ClampToEdgeWrapping;
            diffuse.wrapT = THREE.ClampToEdgeWrapping;
            // diffuse.wrapS = THREE.RepeatWrapping;
            // diffuse.wrapT = THREE.RepeatWrapping;
            diffuse.generateMipmaps = true;
            diffuse.needsUpdate = true;

            atlas.atlas = diffuse;
        }

        this.onLoad();
    }

    loadType_(t) {
        if (typeof(t) == 'string') {
            const texture = this.loader_.load(t);
            return () => {
                return _GetImageData(texture.image);
            };
        } else {
            return () => {
                return t;
            };
        }
    }

    loadAtlas_(atlas, names) {
        this.textures_[atlas] = {
            textures: names.map(n => this.loadType_(n))
        };
    }
}
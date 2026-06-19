// three-background.js
class ThreeBackground {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.dishes = [];
        this.connectionLines = [];
        this.contactPoints = [];
        this.particles = null;
        this.clock = new THREE.Clock();
        this.mouseX = 0;
        this.mouseY = 0;
        this.antennaGroup = null;
        this.orbitLines = [];
        
        this.init();
        this.createGlobe();
        this.createContactPoints();
        this.createConnectionLines();
        this.createMultipleAntennas();
        this.createOrbitLines();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
        this.updateTheme();
        this.customCursor();
    }
    
    init() {
        const container = document.getElementById('three-background');
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a1a, 12, 30);
        
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 1.5, 14);
        this.camera.lookAt(0, 0, 0);
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            alpha: true,
            powerPreference: "low-power"
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        this.renderer.setClearColor(0x0a0a1a, 0);
        container.appendChild(this.renderer.domElement);
        
        const ambientLight = new THREE.AmbientLight(0x404060, 0.4);
        this.scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        this.scene.add(dirLight);
    }
    
    createGlobe() {
        const geometry = new THREE.SphereGeometry(3, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x0a2a5c,
            emissive: 0x0a1a3c,
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.7,
            shininess: 20
        });
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        const gridGeometry = new THREE.SphereGeometry(3.02, 20, 20);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            wireframe: true,
            transparent: true,
            opacity: 0.06
        });
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        this.globe.add(grid);
    }
    
    createContactPoints() {
        const cities = [
            { lat: 35.6892, lng: 51.3890 },
            { lat: 40.7128, lng: -74.0060 },
            { lat: 51.5074, lng: -0.1278 },
            { lat: 48.8566, lng: 2.3522 },
            { lat: 55.7558, lng: 37.6173 },
            { lat: 35.6762, lng: 139.6503 },
            { lat: -33.8688, lng: 151.2093 },
            { lat: -23.5505, lng: -46.6333 },
            { lat: 19.0760, lng: 72.8777 },
            { lat: 31.2304, lng: 121.4737 },
            { lat: 30.0444, lng: 31.2357 },
            { lat: 41.9028, lng: 12.4964 }
        ];
        
        const radius = 3.05;
        
        cities.forEach((city) => {
            const lat = city.lat * Math.PI / 180;
            const lng = city.lng * Math.PI / 180;
            
            const x = radius * Math.cos(lat) * Math.cos(lng);
            const y = radius * Math.sin(lat);
            const z = radius * Math.cos(lat) * Math.sin(lng);
            
            const dotGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const dotMat = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                transparent: true,
                opacity: 0.8
            });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(x, y, z);
            this.globe.add(dot);
            
            this.contactPoints.push({
                mesh: dot,
                x: x, y: y, z: z,
                speed: 0.03 + Math.random() * 0.04,
                phase: Math.random() * Math.PI * 2,
                pulse: Math.random() * Math.PI * 2
            });
        });
    }
    
    createConnectionLines() {
        const points = this.contactPoints;
        let lineCount = 0;
        const maxLines = 15;
        
        for (let i = 0; i < points.length && lineCount < maxLines; i++) {
            for (let j = i + 1; j < points.length && lineCount < maxLines; j++) {
                const p1 = points[i];
                const p2 = points[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dz = p1.z - p2.z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                if (dist < 4.5 && dist > 1.5) {
                    const midX = (p1.x + p2.x) / 2 * 1.08;
                    const midY = (p1.y + p2.y) / 2 * 1.08;
                    const midZ = (p1.z + p2.z) / 2 * 1.08;
                    
                    const curvePoints = [];
                    for (let k = 0; k <= 16; k++) {
                        const t = k / 16;
                        const t1 = 1 - t;
                        const cx = t1*t1 * p1.x + 2*t1*t * midX + t*t * p2.x;
                        const cy = t1*t1 * p1.y + 2*t1*t * midY + t*t * p2.y;
                        const cz = t1*t1 * p1.z + 2*t1*t * midZ + t*t * p2.z;
                        const r = Math.sqrt(cx*cx + cy*cy + cz*cz);
                        const scale = 1 + 0.12 * Math.sin(t * Math.PI);
                        curvePoints.push(new THREE.Vector3(
                            cx * scale,
                            cy * scale,
                            cz * scale
                        ));
                    }
                    
                    const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
                    const curveMat = new THREE.LineBasicMaterial({
                        color: 0x4488ff,
                        transparent: true,
                        opacity: 0.06
                    });
                    const line = new THREE.Line(curveGeo, curveMat);
                    this.globe.add(line);
                    
                    const particleGeo = new THREE.SphereGeometry(0.02, 4, 4);
                    const particleMat = new THREE.MeshBasicMaterial({
                        color: 0x88ddff,
                        transparent: true,
                        opacity: 0.6
                    });
                    const particle = new THREE.Mesh(particleGeo, particleMat);
                    particle.position.copy(curvePoints[0]);
                    this.globe.add(particle);
                    
                    this.connectionLines.push({
                        line: line,
                        particle: particle,
                        points: curvePoints,
                        speed: 0.15 + Math.random() * 0.15,
                        offset: Math.random() * 100
                    });
                    lineCount++;
                }
            }
        }
    }
    
    createMultipleAntennas() {
        this.antennaGroup = new THREE.Group();
        this.scene.add(this.antennaGroup);
        
        const positions = [
            { x: -4.5, y: -0.3, z: 0.5, rot: 0.2 },
            { x: 4.2, y: -0.5, z: -0.8, rot: -0.3 },
            { x: -3.8, y: 0.2, z: -2.5, rot: 0.5 },
            { x: 3.5, y: 0.1, z: 2.8, rot: -0.4 },
            { x: 0, y: -0.8, z: 4.5, rot: 0 },
            { x: -2.5, y: 0.5, z: 4.0, rot: 0.3 },
            { x: 2.8, y: 0.3, z: -4.2, rot: -0.2 }
        ];
        
        positions.forEach((pos) => {
            const dish = this.createSingleAntenna();
            dish.position.set(pos.x, pos.y, pos.z);
            dish.rotation.y = pos.rot;
            dish.userData = {
                rotSpeed: 0.1 + Math.random() * 0.2,
                bobSpeed: 0.2 + Math.random() * 0.3,
                bobAmount: 0.02 + Math.random() * 0.03,
                phase: Math.random() * Math.PI * 2
            };
            this.antennaGroup.add(dish);
            this.dishes.push(dish);
        });
    }
    
    createSingleAntenna() {
        const group = new THREE.Group();
        
        const baseGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.2, 6);
        const baseMat = new THREE.MeshPhongMaterial({
            color: 0x445577,
            metalness: 0.5,
            roughness: 0.5
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.1;
        group.add(base);
        
        const poleGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.8, 4);
        const poleMat = new THREE.MeshPhongMaterial({
            color: 0x88aacc,
            metalness: 0.4,
            roughness: 0.6
        });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 0.5;
        group.add(pole);
        
        const dishGroup = new THREE.Group();
        dishGroup.position.y = 0.9;
        dishGroup.rotation.x = -0.3;
        group.add(dishGroup);
        
        const dishGeo = new THREE.CylinderGeometry(0.3, 0.04, 0.2, 8, 1, true);
        const dishMat = new THREE.MeshPhongMaterial({
            color: 0x88aacc,
            metalness: 0.7,
            roughness: 0.3,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const dishMesh = new THREE.Mesh(dishGeo, dishMat);
        dishMesh.rotation.x = Math.PI / 2;
        dishMesh.position.z = -0.1;
        dishGroup.add(dishMesh);
        
        const rimGeo = new THREE.TorusGeometry(0.3, 0.015, 6, 12);
        const rimMat = new THREE.MeshPhongMaterial({
            color: 0x99bbdd,
            metalness: 0.5,
            roughness: 0.4
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.z = 0.1;
        dishGroup.add(rim);
        
        const lightGeo = new THREE.SphereGeometry(0.025, 6, 6);
        const lightMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8
        });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.set(0, 0.1, 0.25);
        dishGroup.add(light);
        group.userData.light = light;
        
        const waveGeo = new THREE.TorusGeometry(0.15, 0.008, 6, 12);
        const waveMat = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            transparent: true,
            opacity: 0.15
        });
        const wave = new THREE.Mesh(waveGeo, waveMat);
        wave.rotation.x = Math.PI / 2;
        wave.position.z = 0.05;
        dishGroup.add(wave);
        group.userData.wave = wave;
        
        return group;
    }
    
    createOrbitLines() {
        const orbitColors = [0x4488ff, 0x00ff88, 0xff8844];
        
        for (let i = 0; i < 3; i++) {
            const radius = 3.8 + i * 0.6;
            const points = [];
            const segments = 32;
            
            for (let j = 0; j <= segments; j++) {
                const theta = (j / segments) * Math.PI * 2;
                const tilt = i * 0.3;
                points.push(new THREE.Vector3(
                    radius * Math.cos(theta),
                    radius * Math.sin(theta) * Math.sin(tilt),
                    radius * Math.sin(theta) * Math.cos(tilt)
                ));
            }
            
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: orbitColors[i % orbitColors.length],
                transparent: true,
                opacity: 0.04
            });
            const line = new THREE.Line(geo, mat);
            this.globe.add(line);
            this.orbitLines.push({
                line: line,
                speed: 0.02 + i * 0.01,
                tilt: i * 0.3
            });
        }
    }
    
    createParticles() {
        const count = 300;
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 10 + Math.random() * 15;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.04,
            color: 0x6688aa,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        
        this.globe.rotation.y += delta * 0.04;
        
        this.contactPoints.forEach((point) => {
            const pulse = 0.8 + Math.sin(time * point.pulse + point.phase) * 0.2;
            point.mesh.scale.set(pulse, pulse, pulse);
        });
        
        this.connectionLines.forEach((conn) => {
            const progress = (time * conn.speed + conn.offset) % 1;
            const idx = Math.floor(progress * (conn.points.length - 1));
            const nextIdx = Math.min(idx + 1, conn.points.length - 1);
            const frac = (progress * (conn.points.length - 1)) % 1;
            
            if (conn.points[idx] && conn.points[nextIdx]) {
                const p1 = conn.points[idx];
                const p2 = conn.points[nextIdx];
                conn.particle.position.lerpVectors(p1, p2, frac);
            }
        });
        
        this.dishes.forEach((dish) => {
            const data = dish.userData;
            dish.rotation.y += delta * data.rotSpeed;
            dish.position.y += Math.sin(time * data.bobSpeed + data.phase) * delta * data.bobAmount;
            
            if (data.light) {
                data.light.material.opacity = 0.3 + Math.sin(time * 3 + data.phase) * 0.5;
            }
            
            if (data.wave) {
                const scale = 1 + Math.sin(time * 2 + data.phase) * 0.3;
                data.wave.scale.set(scale, scale, 1);
                data.wave.material.opacity = 0.1 + Math.sin(time * 2 + data.phase) * 0.08;
            }
        });
        
        this.orbitLines.forEach((orbit) => {
            orbit.line.rotation.y += delta * orbit.speed;
        });
        
        if (this.particles) {
            this.particles.rotation.y += delta * 0.002;
        }
        
        this.camera.position.x = Math.sin(this.mouseX * 0.15) * 0.4;
        this.camera.position.y = 1.5 + Math.sin(this.mouseY * 0.1) * 0.2;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
        
        window.addEventListener('resize', () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
        
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                setTimeout(() => this.updateTheme(), 100);
            });
        }
    }
    
    updateTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark');
        const isNight = body.classList.contains('night');
        
        let bgColor = 0x0a0a1a;
        let fogColor = 0x0a0a1a;
        let globeColor = 0x0a2a5c;
        let globeEmissive = 0x0a1a3c;
        
        if (isNight) {
            bgColor = 0x08080f;
            fogColor = 0x08080f;
            globeColor = 0x1a1a3a;
            globeEmissive = 0x0a0a1a;
        } else if (isDark) {
            bgColor = 0x05050f;
            fogColor = 0x05050f;
            globeColor = 0x0a1a3a;
            globeEmissive = 0x050510;
        }
        
        this.scene.fog.color.setHex(fogColor);
        this.renderer.setClearColor(bgColor, 0);
        
        if (this.globe) {
            this.globe.material.color.setHex(globeColor);
            this.globe.material.emissive.setHex(globeEmissive);
        }
    }
    
    customCursor() {
        const style = document.createElement('style');
        style.textContent = `
            body, body * { cursor: crosshair !important; }
            a, button, .nav-link, .theme-btn, .feature-link, .btn-secondary, .btn-primary, .social-links a, .footer-links a { cursor: pointer !important; }
            input, select, textarea { cursor: text !important; }
            #three-background { cursor: crosshair !important; }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ThreeBackground();
});

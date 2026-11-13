/**
 * Youthinity 3D Hero Scene
 * Implements webskill & hero-section standards:
 * - High-craft 3D subject (Student Career Constellation)
 * - Mouse parallax & Raycaster interactive nodes
 * - Graceful fallback & reduced-motion support
 */

class HeroScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.nodes = [];
    this.particles = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredNode = null;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    // 1. Scene setup
    this.scene = new THREE.Scene();

    // 2. Camera setup
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.z = 18;

    // 3. Renderer setup
    try {
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);
    } catch (e) {
      console.warn("WebGL not supported, showing fallback", e);
      return;
    }

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xff5e3a, 1.8);
    dirLight1.position.set(10, 15, 12);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00e5ff, 1.2);
    dirLight2.position.set(-10, -10, -8);
    this.scene.add(dirLight2);

    // 5. Build Core Constellation
    this.buildConstellation();

    // 6. Build Ambient Starfield / Spark Particles
    this.buildParticles();

    // 7. Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.container.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.container.addEventListener('pointerleave', () => {
      this.mouse.x = -999;
      this.mouse.y = -999;
      this.clearHover();
    });

    // 8. Animation Loop
    this.clock = new THREE.Clock();
    this.animate();
  }

  buildConstellation() {
    this.constellationGroup = new THREE.Group();
    this.scene.add(this.constellationGroup);

    // Inner glowing wireframe nucleus
    const nucleusGeom = new THREE.IcosahedronGeometry(3.6, 2);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x0f172a
    });
    this.nucleus = new THREE.Mesh(nucleusGeom, nucleusMat);
    this.constellationGroup.add(this.nucleus);

    // Inner glowing point light
    const nucleusLight = new THREE.PointLight(0xff7733, 2, 20);
    this.constellationGroup.add(nucleusLight);

    // Orbital ring 1
    const ring1Geom = new THREE.TorusGeometry(6.2, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    this.ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    this.ring1.rotation.x = Math.PI / 3;
    this.constellationGroup.add(this.ring1);

    // Orbital ring 2
    const ring2Geom = new THREE.TorusGeometry(7.4, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0xff5e3a, transparent: true, opacity: 0.35 });
    this.ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    this.ring2.rotation.y = Math.PI / 4;
    this.constellationGroup.add(this.ring2);

    // 5 Major Career Discipline Nodes
    const careerTracks = [
      { name: "Tech & AI", color: 0x00E5FF, radius: 0.65, dist: 5.6, speed: 0.45, yAngle: 0, desc: "Full-Stack, Python, AI Agents" },
      { name: "UI/UX & Design", color: 0xEC4899, radius: 0.6, dist: 6.8, speed: 0.35, yAngle: 1.2, desc: "Figma, Design Systems, 3D" },
      { name: "Finance & Consulting", color: 0xF59E0B, radius: 0.65, dist: 6.2, speed: 0.4, yAngle: 2.5, desc: "Valuations, IB, Case Competitions" },
      { name: "Marketing & Growth", color: 0xFF5E3A, radius: 0.58, dist: 5.2, speed: 0.5, yAngle: 3.8, desc: "Performance, Brand, SEO, Content" },
      { name: "Leadership & Speaking", color: 0x10B981, radius: 0.55, dist: 6.5, speed: 0.38, yAngle: 5.1, desc: "Negotiation, Public Speaking, BD" }
    ];

    const nodeGeom = new THREE.SphereGeometry(1, 32, 32);

    careerTracks.forEach((track) => {
      const mat = new THREE.MeshStandardMaterial({
        color: track.color,
        emissive: track.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      const mesh = new THREE.Mesh(nodeGeom, mat);
      mesh.scale.set(track.radius, track.radius, track.radius);
      mesh.userData = track;

      // Glow halo ring around node
      const haloGeom = new THREE.RingGeometry(track.radius * 1.3, track.radius * 1.5, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: track.color, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.lookAt(0, 0, 1);
      mesh.add(halo);

      this.constellationGroup.add(mesh);
      this.nodes.push(mesh);
    });

    // Connecting laser lines between career nodes & nucleus
    const lineMat = new THREE.LineBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.25 });
    this.connectingLines = [];

    this.nodes.forEach((node) => {
      const lineGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), node.position]);
      const line = new THREE.Line(lineGeom, lineMat);
      this.constellationGroup.add(line);
      this.connectingLines.push({ line, node });
    });
  }

  buildParticles() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0xff5e3a);
    const c2 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const mixed = Math.random() > 0.5 ? c1 : c2;
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onMouseMove(e) {
    if (this.reducedMotion) return;
    this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onPointerMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  checkRaycaster() {
    if (this.mouse.x === -999) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.nodes);

    if (intersects.length > 0) {
      const target = intersects[0].object;
      if (this.hoveredNode !== target) {
        this.clearHover();
        this.hoveredNode = target;
        this.applyHover(target);
      }
    } else {
      this.clearHover();
    }
  }

  applyHover(mesh) {
    mesh.material.emissiveIntensity = 1.4;
    mesh.scale.set(mesh.userData.radius * 1.35, mesh.userData.radius * 1.35, mesh.userData.radius * 1.35);

    // Update floating HUD tooltip
    const hud = document.getElementById('hero-node-hud');
    if (hud) {
      hud.innerHTML = `
        <span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background-color: #${mesh.userData.color.toString(16)}"></span>
        <strong class="text-white">${mesh.userData.name}</strong>: ${mesh.userData.desc}
      `;
      hud.classList.remove('opacity-0');
      hud.classList.add('opacity-100');
    }
  }

  clearHover() {
    if (this.hoveredNode) {
      this.hoveredNode.material.emissiveIntensity = 0.6;
      this.hoveredNode.scale.set(this.hoveredNode.userData.radius, this.hoveredNode.userData.radius, this.hoveredNode.userData.radius);
      this.hoveredNode = null;
    }
    const hud = document.getElementById('hero-node-hud');
    if (hud) {
      hud.classList.remove('opacity-100');
      hud.classList.add('opacity-0');
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Rotate core nucleus
    if (!this.reducedMotion) {
      this.nucleus.rotation.y += 0.004;
      this.nucleus.rotation.x += 0.002;

      this.ring1.rotation.z += 0.003;
      this.ring2.rotation.z -= 0.002;

      if (this.particles) {
        this.particles.rotation.y = time * 0.015;
      }
    }

    // Orbit career nodes
    this.nodes.forEach((node, i) => {
      const data = node.userData;
      const angle = time * data.speed * (this.reducedMotion ? 0.1 : 1) + data.yAngle;
      node.position.x = Math.cos(angle) * data.dist;
      node.position.z = Math.sin(angle) * data.dist;
      node.position.y = Math.sin(time * 0.8 + i) * 1.4;

      // Update connecting line geometry
      if (this.connectingLines[i]) {
        const line = this.connectingLines[i].line;
        const positions = line.geometry.attributes.position.array;
        positions[3] = node.position.x;
        positions[4] = node.position.y;
        positions[5] = node.position.z;
        line.geometry.attributes.position.needsUpdate = true;
      }
    });

    // Smooth camera mouse parallax
    if (!this.reducedMotion) {
      this.targetRotationY = this.mouseX * 0.45;
      this.targetRotationX = this.mouseY * 0.35;
      this.constellationGroup.rotation.y += (this.targetRotationY - this.constellationGroup.rotation.y) * 0.05;
      this.constellationGroup.rotation.x += (this.targetRotationX - this.constellationGroup.rotation.x) * 0.05;
    }

    this.checkRaycaster();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize immediately or when DOM is ready
function startHeroScene() {
  if (typeof THREE !== 'undefined' && document.getElementById('hero-canvas-container')) {
    new HeroScene('hero-canvas-container');
  } else {
    setTimeout(startHeroScene, 50);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHeroScene);
} else {
  startHeroScene();
}

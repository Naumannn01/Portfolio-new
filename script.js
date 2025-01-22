// Background Animation
class ParticleNetwork {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.numberOfParticles = 70; // Increased number of particles
        this.minDistance = 150; // Increased connection distance
        this.animationFrame = null;
        this.mousePosition = { x: 0, y: 0 };

        this.init();
        window.addEventListener('resize', () => this.init());
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.particles = [];
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 2, // Increased particle size
                baseColor: Math.random() > 0.5 ? '#64ffda' : '#ffffff' // Random between accent and white
            });
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];

            // Move particles
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Create glow effect
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
            gradient.addColorStop(0, p.baseColor);
            gradient.addColorStop(1, 'transparent');

            // Draw particle with glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Draw core of particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = p.baseColor;
            this.ctx.fill();

            // Connect particles
            for (let j = i + 1; j < this.particles.length; j++) {
                let p2 = this.particles[j];
                let dx = p.x - p2.x;
                let dy = p.y - p2.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.minDistance) {
                    // Create gradient line
                    const gradient = this.ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
                    gradient.addColorStop(0, `rgba(100, 255, 218, ${(1 - distance/this.minDistance) * 0.5})`);
                    gradient.addColorStop(1, `rgba(255, 255, 255, ${(1 - distance/this.minDistance) * 0.5})`);

                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }

            // Interactive effect with mouse
            let dx = this.mousePosition.x - p.x;
            let dy = this.mousePosition.y - p.y;
            let mouseDistance = Math.sqrt(dx * dx + dy * dy);
            if (mouseDistance < 150) {
                p.radius = Math.min(p.radius + 0.5, 4); // Grow particle size
            } else {
                p.radius = Math.max(p.radius - 0.1, 2); // Shrink back to normal
            }
        }

        // Fade effect based on scroll position
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        this.canvas.style.opacity = Math.max(0.3 - scrollPercent * 0.3, 0); // Increased base opacity

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        document.querySelector(targetId).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 3D Object Animation
class Scene3D {
    constructor() {
        this.container = document.getElementById('hero-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Camera position
        this.camera.position.z = 5;

        // Create geometric shape (dodecahedron)
        const geometry = new THREE.DodecahedronGeometry(1.5, 0);
        const material = new THREE.MeshPhongMaterial({
            color: 0x64ffda,
            wireframe: true,
            wireframeLinewidth: 2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);

        // Mouse movement variables
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start animation
        this.animate();
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX - this.windowHalfX) / 100;
        this.mouse.y = (event.clientY - this.windowHalfY) / 100;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth rotation
        this.targetRotation.x += (this.mouse.y - this.targetRotation.x) * 0.05;
        this.targetRotation.y += (this.mouse.x - this.targetRotation.y) * 0.05;

        // Apply rotation
        this.mesh.rotation.x = this.targetRotation.x;
        this.mesh.rotation.y = this.targetRotation.y;

        // Automatic rotation for mobile
        if (window.innerWidth <= 768) {
            this.mesh.rotation.x += 0.005;
            this.mesh.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize both animations when the page loads
window.addEventListener('load', () => {
    new ParticleNetwork();
    new Scene3D();
});

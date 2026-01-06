// Spider Web Network Animation Script - Fixed Version
// This creates an animated particle network visualization

// Wait for DOM to be fully loaded
window.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('webCanvas');
    if (!canvas) {
        console.warn('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let animationId;

    function resizeCanvas() {
        const container = canvas.parentElement;
        if (container) {
            width = container.offsetWidth;
            height = container.offsetHeight;
            canvas.width = width;
            canvas.height = height;
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Main network nodes (Problem, Solution, Resolution)
    const mainNodes = [
        { x: 0.17, y: 0.35 },  // Left (Problem)
        { x: 0.5,  y: 0.35 },   // Center (Solution)
        { x: 0.83, y: 0.35 }   // Right (Resolution)
    ];

    // Floating particles for web effect
    const particles = [];

    function initParticles() {
        particles.length = 0; // Clear existing
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 2 + 1
            });
        }
    }

    initParticles();

    function drawSpiderWeb() {
        if (!ctx || width === 0 || height === 0) return;

        ctx.clearRect(0, 0, width, height);

        // Draw main node connections (thick glowing lines)
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(15, 23, 42, 0.3)';

        for (let i = 0; i < mainNodes.length; i++) {
            for (let j = i + 1; j < mainNodes.length; j++) {
                ctx.beginPath();
                ctx.moveTo(mainNodes[i].x * width, mainNodes[i].y * height);
                ctx.lineTo(mainNodes[j].x * width, mainNodes[j].y * height);
                ctx.stroke();
            }
        }

        // Draw and update particles
        particles.forEach(p => {
            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges with margin
            if (p.x < 0 || p.x > width) {
                p.vx *= -1;
                p.x = Math.max(0, Math.min(width, p.x));
            }
            if (p.y < 0 || p.y > height) {
                p.vy *= -1;
                p.y = Math.max(0, Math.min(height, p.y));
            }

            // Draw glowing particle
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(15, 23, 42, 0.8)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw web connections to nearby particles
            particles.forEach(p2 => {
                if (p === p2) return;

                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    const opacity = 0.2 * (1 - dist / 100);
                    ctx.strokeStyle = `rgba(15, 23, 42, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.shadowBlur = 3;
                    ctx.shadowColor = `rgba(15, 23, 42, ${opacity * 1.5})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        animationId = requestAnimationFrame(drawSpiderWeb);
    }

    // Start animation
    drawSpiderWeb();

    // Cleanup on page unload
    window.addEventListener('beforeunload', function () {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });

    // Reinitialize particles on resize
    window.addEventListener('resize', function () {
        resizeCanvas();
        initParticles();
    });
});

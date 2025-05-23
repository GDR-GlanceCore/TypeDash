const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let stars = [], planets = [], nebula = [];
    const starCount = 1200;
    let width, height, centerX, centerY;
    const focalLength = 300;

    let inputX = 0, inputY = 0;
    let targetX = 0, targetY = 0;

    function resizeCanvas() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      centerX = width / 2;
      centerY = height / 2;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', e => {
      targetX = (e.clientX - centerX) * 0.002;
      targetY = (e.clientY - centerY) * 0.002;
    });

    window.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      targetX = (touch.clientX - centerX) * 0.002;
      targetY = (touch.clientY - centerY) * 0.002;
    }, { passive: false });

    function createStars() {
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: (Math.random() - 0.5) * width * 2,
          y: (Math.random() - 0.5) * height * 2,
          z: Math.random() * width,
          color: `hsl(${Math.random() * 360}, 100%, 80%)`
        });
      }
    }

    function createPlanets() {
      planets = [
        {
          x: width * 0.2,
          y: height * 0.3,
          r: 80,
          parallax: 0.05,
          color: '#5533ff'
        },
        {
          x: width * 0.75,
          y: height * 0.6,
          r: 100,
          parallax: 0.08,
          color: '#33ffff'
        }
      ];
    }

    function createNebula() {
      nebula = [];
      for (let i = 0; i < 30; i++) {
        nebula.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 100 + Math.random() * 200,
          color: `hsla(${Math.random() * 360}, 100%, 70%, 0.05)`,
          parallax: 0.02 + Math.random() * 0.02
        });
      }
    }

    function drawBackground() {
      // Update control interpolation
      inputX += (targetX - inputX) * 0.05;
      inputY += (targetY - inputY) * 0.05;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Draw parallax nebula
      for (let cloud of nebula) {
        const offsetX = inputX * cloud.parallax * 200;
        const offsetY = inputY * cloud.parallax * 200;
        ctx.beginPath();
        ctx.fillStyle = cloud.color;
        ctx.arc(cloud.x + offsetX, cloud.y + offsetY, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw planets
      for (let p of planets) {
        const offsetX = inputX * p.parallax * 200;
        const offsetY = inputY * p.parallax * 200;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = p.color;
        ctx.arc(p.x + offsetX, p.y + offsetY, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Star tunnel
      for (let star of stars) {
        star.z -= 6;

        star.x += inputX * star.z * 0.02;
        star.y += inputY * star.z * 0.02;

        if (star.z <= 0 || Math.abs(star.x) > width || Math.abs(star.y) > height) {
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
          star.z = width;
          star.color = `hsl(${Math.random() * 360}, 100%, 80%)`;
        }

        const scale = focalLength / star.z;
        const x = star.x * scale + centerX;
        const y = star.y * scale + centerY;

        const trailScale = focalLength / (star.z + 10);
        const px = star.x * trailScale + centerX;
        const py = star.y * trailScale + centerY;

        ctx.strokeStyle = star.color;
        ctx.lineWidth = scale * 1.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = star.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    function drawForeground() {
      // Placeholder for game elements
      ctx.font = '20px monospace';
      ctx.fillStyle = 'white';
      // ctx.fillText('🚀 Insert game here...', 30, 40);
    }

    function gameLoop() {
      drawBackground();
      drawForeground();
      requestAnimationFrame(gameLoop);
    }

    createStars();
    createPlanets();
    createNebula();
    gameLoop();
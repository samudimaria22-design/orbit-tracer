
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    canvas.style.cssText = "position:fixed;top:0;left:0;z-index:9999999;background:#0f172a;touch-action:none;";

    let w, h, score, gameActive, player, enemies, collectibles, particles;
    const orbits = [60, 110, 160, 210];

    function init() {
        score = 0;
        gameActive = true;
        player = { orbit: 1, angle: 0, dir: 1, speed: 0.04 };
        enemies = [];
        collectibles = [];
        particles = [];
        spawnCollectible();
    }

    const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    function spawnCollectible() {
        collectibles.push({
            orbit: Math.floor(Math.random() * orbits.length),
            angle: Math.random() * Math.PI * 2
        });
    }

    function spawnEnemy() {
        if (enemies.length < 5 + score / 5) {
            enemies.push({
                orbit: Math.floor(Math.random() * orbits.length),
                angle: Math.random() * Math.PI * 2,
                speed: (0.02 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1)
            });
        }
    }

    const handleInput = (e) => {
        if(e.type === 'touchstart') e.preventDefault();
        if (!gameActive) { init(); return; }
        
        // Meccanica unica: Cambia orbita e direzione contemporaneamente
        player.dir *= -1;
        player.orbit = (player.orbit + 1) % orbits.length;
        
        // Effetto visivo al cambio
        createExplosion(
            w/2 + Math.cos(player.angle) * orbits[player.orbit],
            h/2 + Math.sin(player.angle) * orbits[player.orbit], 
            '#38bdf8', 5
        );
    };

    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput, {passive: false});

    function createExplosion(x, y, color, count) {
        for(let i=0; i<count; i++) {
            particles.push({
                x, y, 
                vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                life: 1, color
            });
        }
    }

    function draw() {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Trail effect
        ctx.fillRect(0, 0, w, h);

        if (gameActive) {
            // Disegna Orbite
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 2;
            orbits.forEach(r => {
                ctx.beginPath();
                ctx.arc(w/2, h/2, r, 0, Math.PI*2);
                ctx.stroke();
            });

            // Update Player
            player.angle += player.speed * player.dir;
            const px = w/2 + Math.cos(player.angle) * orbits[player.orbit];
            const py = h/2 + Math.sin(player.angle) * orbits[player.orbit];

            // Update & Draw Collectibles
            collectibles.forEach((c, i) => {
                const cx = w/2 + Math.cos(c.angle) * orbits[c.orbit];
                const cy = h/2 + Math.sin(c.angle) * orbits[c.orbit];
                
                ctx.fillStyle = "#fff";
                ctx.shadowBlur = 10; ctx.shadowColor = "#fff";
                ctx.fillRect(cx-5, cy-5, 10, 10);
                
                if (Math.hypot(px-cx, py-cy) < 15) {
                    collectibles.splice(i, 1);
                    score++;
                    createExplosion(cx, cy, "#fff", 10);
                    spawnCollectible();
                    if(score % 2 === 0) spawnEnemy();
                }
            });

            // Update & Draw Enemies
            enemies.forEach(en => {
                en.angle += en.speed;
                const ex = w/2 + Math.cos(en.angle) * orbits[en.orbit];
                const ey = h/2 + Math.sin(en.angle) * orbits[en.orbit];
                
                ctx.fillStyle = "#ef4444";
                ctx.shadowBlur = 15; ctx.shadowColor = "#ef4444";
                ctx.beginPath();
                ctx.moveTo(ex, ey-8); ctx.lineTo(ex+8, ey+8); ctx.lineTo(ex-8, ey+8);
                ctx.fill();

                if (en.orbit === player.orbit && Math.abs(en.angle % (Math.PI*2) - player.angle % (Math.PI*2)) < 0.1) {
                    if (Math.hypot(px-ex, py-ey) < 15) gameActive = false;
                }
            });

            // Draw Player
            ctx.fillStyle = "#38bdf8";
            ctx.shadowBlur = 20; ctx.shadowColor = "#38bdf8";
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Particles
            particles.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.02;
                ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
                ctx.fillRect(p.x, p.y, 2, 2);
                if(p.life <= 0) particles.splice(i, 1);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = "#fff";
            ctx.font = "bold 40px Monospace";
            ctx.textAlign = "center";
            ctx.fillText(score, w/2, h/2 + 10);

        } else {
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0,0,w,h);
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.font = "30px Monospace";
            ctx.fillText("SISTEMA CORROTTO", w/2, h/2 - 20);
            ctx.font = "20px Monospace";
            ctx.fillText("SCORE: " + score, w/2, h/2 + 20);
            ctx.fillStyle = "#38bdf8";
            ctx.fillText("TOCCA PER RIAVVIARE", w/2, h/2 + 70);
        }
        requestAnimationFrame(draw);
    }

    init();
    draw();

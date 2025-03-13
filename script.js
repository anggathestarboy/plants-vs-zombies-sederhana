// Mengambil elemen canvas dan mengatur konteksnya
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 600;

// Mengambil input username dan level dari HTML
const usernameInput = document.getElementById("username");
const levelSelect = document.getElementById("level");
const inputContainer = document.getElementById("inputContainer");

let username = "";
let level = "easy";
let currentScene = "menu";
let plants = [];
let zombies = [];
let suns = [];
let sunAmount = 0;
let gameOver = false;

// Gambar dan Asset
const backgroundImage = new Image();
backgroundImage.src = "sprites/General/background.jpg";

const logo = new Image();
logo.src = "sprites/general/logo.png";

const sunImage = new Image();
sunImage.src = "sprites/General/sun.png";

const peaShooterImage = new Image();  // Gambar untuk PeaShooter
peaShooterImage.src = "Sprites/PeaShooter/frame_00_delay-0.12s.gif";  // Path gambar PeaShooter

const zombieImage = new Image();  // Gambar untuk Zombie
zombieImage.src = "sprites/Zombie/frame_12_delay-0.05s.gif";  // Path gambar Zombie

const peaImage = new Image();  // Gambar untuk Pea (peluru)
peaImage.src = "Sprites/General/Pea.png";  // Path gambar Pea

// Fungsi untuk menggambar tombol
function drawButton(x, y, width, height, text, isHovered, color, hoverColor, isDisabled = false) {
    ctx.fillStyle = isDisabled ? "#ccc" : (isHovered ? hoverColor : color);
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + width / 2, y + height / 2);
}

// Fungsi untuk menggambar scene menu
function drawMenuScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const logoWidth = 400;
    const logoHeight = 200;
    const logoX = (canvas.width - logoWidth) / 2;
    const logoY = 50;
    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

    const playButtonX = (canvas.width / 2) - 170;
    const playButtonY = canvas.height - 150;
    drawButton(playButtonX, playButtonY, 150, 50, "Play Game", false, "#4CAF50", "#45a049", !username);

    const instructionButtonX = (canvas.width / 2) + 20;
    const instructionButtonY = canvas.height - 150;
    drawButton(instructionButtonX, instructionButtonY, 150, 50, "Instructions", false, "#FFD700", "#e6b800");
}

// Fungsi untuk menggambar scene game
function drawGameScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    // Menggambar sun
    for (let sun of suns) {
        sun.draw();
    }

    // Menggambar plants (termasuk PeaShooter)
    for (let plant of plants) {
        plant.draw();
    }

    // Menggambar peluru
    for (let pea of peas) {
        pea.draw();
    }

    // Menggambar zombies
    for (let zombie of zombies) {
        zombie.draw();
    }

    // Update sun count
    ctx.fillStyle = "#fff";
    ctx.font = "20px Arial";
    ctx.fillText("Suns: " + sunAmount, 10, 30);

    // Cek apakah game over
    if (gameOver) {
        ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    }
}

// Fungsi untuk menangani klik untuk mulai permainan
function handleClick(event) {
    if (currentScene === "menu") {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Jika tombol play ditekan dan username ada
        const playButtonX = (canvas.width / 2) - 170;
        const playButtonY = canvas.height - 150;
        if (mouseX >= playButtonX && mouseX <= playButtonX + 150 && mouseY >= playButtonY && mouseY <= playButtonY + 50) {
            if (username) {
                currentScene = "game";
                inputContainer.style.display = "none";
                drawGameScene();
                startGame();
            } else {
                alert("Please enter a username!");
            }
        }

        // Jika tombol instruksi ditekan
        const instructionButtonX = (canvas.width / 2) + 20;
        const instructionButtonY = canvas.height - 150;
        if (mouseX >= instructionButtonX && mouseX <= instructionButtonX + 150 && mouseY >= instructionButtonY && mouseY <= instructionButtonY + 50) {
            showInstructionPopup();
        }
    } else if (currentScene === "game") {
        // Menambahkan PeaShooter di lokasi klik jika sun mencukupi
        if (sunAmount >= 100) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Menambahkan PeaShooter di lokasi klik
            plants.push(new PeaShooter(mouseX - 40, mouseY - 40));  // Menggeser agar PeaShooter terletak di klik
            sunAmount -= 100;  // Mengurangi jumlah sun setelah menambahkan PeaShooter
        }
    }
}

// Fungsi untuk menunjukkan instruksi
function showInstructionPopup() {
    document.getElementById("instructionPopup").style.display = "flex";
}

function closeInstructionPopup() {
    document.getElementById("instructionPopup").style.display = "none";
}

// Fungsi untuk mulai permainan
function startGame() {
    gameOver = false;
    generateSuns();  // Mulai generasi sun
    spawnZombie();   // Spawn zombie pertama
    gameLoop();
}

// Fungsi untuk game loop
function gameLoop() {
    if (gameOver) return;
    drawGameScene();
    updateGameObjects();
    requestAnimationFrame(gameLoop);  // Melakukan loop secara berulang
}

// Fungsi untuk memperbarui objek-objek game
function updateGameObjects() {
    // Update sun
    for (let sun of suns) {
        sun.update();
    }

    // Update zombie
    for (let zombie of zombies) {
        zombie.update();
    }

    // Update peluru
    for (let pea of peas) {
        pea.update();
    }

    // Mengecek tabrakan peluru dan zombie
    for (let pea of peas) {
        for (let i = zombies.length - 1; i >= 0; i--) {
            const zombie = zombies[i];
            if (pea.collidesWith(zombie)) {
                zombie.hit();
                peas.splice(peas.indexOf(pea), 1);  // Hapus peluru yang mengenai zombie
                break;  // Menghentikan pengecekan setelah satu peluru mengenai satu zombie
            }
        }
    }

    // Mengecek tabrakan zombie dan plant (Perubahan: tanaman hilang saat tertabrak zombie)
    for (let zombie of zombies) {
        for (let i = plants.length - 1; i >= 0; i--) {  // Loop melalui plants dari belakang (untuk menghindari masalah saat menghapus)
            const plant = plants[i];
            if (plant.collidesWith(zombie)) {
                plants.splice(i, 1); // Menghapus tanaman yang tertabrak
                break;  // Hanya menghapus satu tanaman per tabrakan zombie
            }
        }
    }
}

// Menambahkan event listener untuk klik dan close popup
document.getElementById("closePopup").addEventListener("click", closeInstructionPopup);

// Fungsi untuk menangani input username dan level
usernameInput.addEventListener("input", (event) => {
    username = event.target.value;
});
levelSelect.addEventListener("change", (event) => {
    level = event.target.value;
});

// Fungsi untuk generasi sun
function generateSuns() {
    setInterval(() => {
        if (!gameOver) {
            suns.push(new Sun());
        }
    }, 2000); // Sun akan jatuh setiap 2 detik
}

// Fungsi untuk spawn zombie
function spawnZombie() {
    setInterval(() => {
        if (!gameOver) {
            zombies.push(new Zombie());
        }
    }, 5000); // Zombie akan muncul setiap 5 detik
}

// Objek-objek game seperti Sun, PeaShooter, Zombie
class Sun {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = 0;
    }

    update() {
        this.y += 2;  // Kecepatan jatuh
        if (this.y > canvas.height) {
            suns.splice(suns.indexOf(this), 1);  // Menghapus sun jika sudah keluar layar
        }
    }

    draw() {
        ctx.drawImage(sunImage, this.x - 25, this.y - 25, 50, 50);  // Ukuran gambar sun yang diperbesar menjadi 50x50
    }
}

class PeaShooter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.attack = 10;
        this.width = 80;  // Mengatur ukuran PeaShooter yang lebih besar
        this.height = 80; // Mengatur ukuran PeaShooter yang lebih besar
    }

    draw() {
        ctx.drawImage(peaShooterImage, this.x, this.y, this.width, this.height);  // Ukuran PeaShooter yang diperbesar
    }

    collidesWith(zombie) {
        return zombie.x < this.x + this.width && zombie.x + zombie.width > this.x && zombie.y < this.y + this.height && zombie.y + zombie.height > this.y;
    }
}

// Class Pea (peluru)
class Pea {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 10;
        this.speed = 5;
    }

    update() {
        this.x += this.speed; // Peluru bergerak ke kanan
        if (this.x > canvas.width) {
            peas.splice(peas.indexOf(this), 1);  // Hapus peluru jika keluar dari layar
        }
    }

    draw() {
        ctx.drawImage(peaImage, this.x, this.y, this.width, this.height);  // Gambar Pea
    }

    collidesWith(zombie) {
        return zombie.x < this.x + this.width && zombie.x + zombie.width > this.x && zombie.y < this.y + this.height && zombie.y + zombie.height > this.y;
    }
}

class Zombie {
    constructor() {
        this.x = canvas.width;
        this.y = Math.floor(Math.random() * 5) * 100 + 100;  // Tiga jalur yang berbeda
        this.health = 100;
        this.speed = 1;
        this.width = 80;  // Mengatur ukuran Zombie yang lebih besar
        this.height = 80; // Mengatur ukuran Zombie yang lebih besar
        this.hits = 0;
    }

    update() {
        this.x -= this.speed;  // Zombie bergerak ke kiri
        if (this.x < 0) {
            gameOver = true; // Game over jika zombie mencapai sisi kiri
        }
    }

    draw() {
        ctx.drawImage(zombieImage, this.x, this.y, this.width, this.height);  // Ukuran Zombie yang diperbesar
    }

    hit() {
        this.hits++;
        if (this.hits >= 4) {
            zombies.splice(zombies.indexOf(this), 1);  // Hapus zombie setelah terkena 4 tembakan
        }
    }
}

// Event listener untuk mendeteksi tombol keyboard F (untuk mengambil sun)
window.addEventListener("keydown", function (event) {
    if (event.key === "f") {
        // Cek apakah ada sun yang bisa diambil
        for (let sun of suns) {
            suns.splice(suns.indexOf(sun), 1);  // Menghapus sun yang diklik
            sunAmount += 25;  // Menambah jumlah sun sebanyak 25
            break; // Hanya mengambil satu sun dalam satu kali tekan
        }
    }
});

// Menambahkan peluru ketika PeaShooter menembak
let peas = [];
setInterval(() => {
    // Menambahkan peluru dari setiap PeaShooter
    for (let plant of plants) {
        if (plant instanceof PeaShooter) {
            peas.push(new Pea(plant.x + plant.width, plant.y + plant.height / 2));  // Menembakkan peluru
        }
    }
}, 1000);

// Menggambar scene menu setelah halaman dimuat
window.onload = function () {
    drawMenuScene();
    canvas.addEventListener("click", handleClick);  // Memastikan event click pada canvas ditangani dengan benar
};

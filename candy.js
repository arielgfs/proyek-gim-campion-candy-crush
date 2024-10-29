var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"];
var board = [];
var rows = 9;
var columns = 9;
var score = 0;
var timer = 10;
var highestScore = 0;
var interval;
let emptyScore = [0, 0, 0, 0, 0];
let maxScore = [0, 0, 0, 0, 0]; //untuk menyimpan nilai tertinggi


var currTile;
var otherTile;

window.onload = function () {
    // Setup button to start game
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("hs").addEventListener("click", highScore);
    document.getElementById("credit").addEventListener("click", credit);



    // Load highest score from localStorage
    if (localStorage.getItem("highestScore")) {
        highestScore = parseInt(localStorage.getItem("highestScore"));
        document.getElementById("highScore").innerText = highestScore;
    }
    if (!localStorage.getItem("maxScore")) {
        let string = JSON.stringify(maxScore);
        localStorage.setItem("maxScore", string);
    }
}

function highScore() {

    document.getElementById("menu").style.display = "none";
    document.getElementById("high").style.display = "block";
    document.getElementById("crdt").style.display = "none";
    const score1 = document.getElementById("score1");
    const score2 = document.getElementById("score2");
    const score3 = document.getElementById("score3");
    const score4 = document.getElementById("score4");
    const score5 = document.getElementById("score5");

    let retString = localStorage.getItem("maxScore");
    let maxScore = JSON.parse(retString);
    console.log(maxScore);
    score1.innerText = maxScore[0];
    score2.innerText = maxScore[1];
    score3.innerText = maxScore[2];
    score4.innerText = maxScore[3];
    score5.innerText = maxScore[4];
    document.getElementById("str").addEventListener("click", endGame);

}

function gameover() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("high").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.getElementById("crdt").style.display = "none";
    document.getElementById("over").style.display = "block";
    const scoreO = document.getElementById("scorei");
    scoreO.innerText = score;
    document.getElementById("ovr").addEventListener("click", endGame);
}

function credit() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("crdt").style.display = "block";
    document.getElementById("st").addEventListener("click", endGame);
}

// Funnction untuk start game
function startGame() {
    // Reset score dan timer
    score = 0;
    timer = 10;
    jumpscareShown = false;
    document.getElementById("score").innerText = score;
    document.getElementById("timer").innerText = timer;

    // Hide the menu and show the game board
    document.getElementById("menu").style.display = "none";
    document.getElementById("game").style.display = "block";

    // Generate the game board
    board = [];
    document.getElementById("board").innerHTML = '';
    generateBoard();

    // Start the timer countdown
    interval = setInterval(updateTimer, 1000);

    // Main game loop
    window.setInterval(function () {
        crushCandy();
        slideCandy();
        generateCandy();
    }, 100);
}

// Function to generate the game board
function generateBoard() {
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/" + randomCandy() + ".png";  // Load candy image

            tile.classList.add("tile");


            // Add event listeners for drag and drop
            tile.addEventListener("dragstart", dragStart);
            tile.addEventListener("dragover", dragOver);
            tile.addEventListener("dragenter", dragEnter);
            tile.addEventListener("dragleave", dragLeave);
            tile.addEventListener("drop", dragDrop);
            tile.addEventListener("dragend", dragEnd);

            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }
}

// Helper function to get a random candy
function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)];
}

// Update the timer every second
function updateTimer() {
    timer--;
    document.getElementById("timer").innerText = timer;

    if (timer <= 0) {
        clearInterval(interval);
        gameover();
        let retString = localStorage.getItem("maxScore");
        let emptyScore = JSON.parse(retString);
        emptyScore.push(score);
        emptyScore.sort(function (a, b) { return b - a });
        maxScore = emptyScore.slice(0, 5);
        localStorage.setItem("maxScore", JSON.stringify(maxScore));
    }
}

// End the game when the timer runs out
function endGame() {
    document.getElementById("menu").style.display = "block";
    document.getElementById("high").style.display = "none";
    document.getElementById("game").style.display = "none";
    document.getElementById("crdt").style.display = "none";
    document.getElementById("over").style.display = "none";


    // Save the highest score if needed
    if (score > highestScore) {
        highestScore = score;

        localStorage.setItem("highestScore", highestScore);
        alert("selamat kamu mencapai  rekor score tertinggi baru");
    }

    document.getElementById("highScore").innerText = highestScore;
}

// Drag and drop functionality
function dragStart() {
    currTile = this;
    currTile.classList.add("dragging"); // Tambahkan efek zoom-in
    currTile.style.transition = "none"; // Disable transition while dragging
}


function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    otherTile = e.target; // Set otherTile to the target being dragged over
    otherTile.classList.add("dropped"); // Add a class for visual feedback (optional)
}

function dragLeave() {

}

function dragDrop() {
    otherTile = this;

    // Tukar posisi kedua permen dengan animasi
    let currCoords = currTile.id.split("-");
    let r1 = parseInt(currCoords[0]);
    let c1 = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    // Lakukan perpindahan hanya jika tile adjacent (bersebelahan)
    let moveLeft = c2 == c1 - 1 && r1 == r2;
    let moveRight = c2 == c1 + 1 && r1 == r2;
    let moveUp = r2 == r1 - 1 && c1 == c2;
    let moveDown = r2 == r1 + 1 && c1 == c2;
    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        // Swap posisi
        swapCandies(currTile, otherTile);

        // Cek apakah salah satu tile adalah bom
        if (currTile.src.includes("bomb") || otherTile.src.includes("bomb")) {
            // Ambil koordinat bom
            let bombRow = currTile.src.includes("bomb") ? r1 : r2;
            let bombCol = currTile.src.includes("bomb") ? c1 : c2;

            // Ledakkan bom
            explodeBomb(bombRow, bombCol);
            return; // Keluar dari fungsi setelah bom meledak
        }

        if(currTile.src.includes("magicCandy") || otherTile.src.includes("magicCandy")){
            explodeMagicCandy(currTile.src.includes("magicCandy") ?  currTile : otherTile);
            return;

        }

        // Cek apakah perpindahan valid
        let validMove = checkValid();
        if (!validMove) {
            document.getElementById("board").classList.add("no-interaction");
            // Batalkan perpindahan jika tidak valid, kembalikan posisi
            setTimeout(() => {
                swapCandies(currTile, otherTile);
                document.getElementById("board").classList.remove("no-interaction");
            }, 500); // Tunggu hingga animasi perpindahan selesai
        }
    }
}

function explodeMagicCandy(candyTile) {
    const coords = candyTile.id.split("-");
    const row = parseInt(coords[0]);
    const col = parseInt(coords[1]);

    // Hancurkan candy di sekitar Magic Candy
    const surroundingCoords = [
        { r: row - 3, c: col }, // Atas
        { r: row + 3, c: col }, // Bawah
        { r: row, c: col - 3 }, // Kiri
        { r: row, c: col + 3 },  // Kanan
        { r: row - 2, c: col },
        { r: row + 2, c: col }, 
        { r: row, c: col - 2 },
        { r: row, c: col + 2 },
        { r: row - 1, c: col },
        { r: row + 1, c: col }, 
        { r: row, c: col - 1 },
        { r: row, c: col + 1 } 
    ];

    surroundingCoords.forEach(({ r, c }) => {
        // Pastikan koordinat berada dalam batas
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
            let candy = board[r][c];
            if (!candy.src.includes("blank") && !candy.src.includes("bomb")) {
                // Hancurkan permen yang terkena ledakan
                candy.src = "./images/blank.png"; // Ganti dengan gambar kosong
                score += 20; // Tambah skor untuk setiap permen yang hancur
                createExplosionAnimation(r, c); // Panggil animasi ledakan
            }
        }
    });

    // Hapus Magic Candy dari papan
    candyTile.src = "./images/blank.png"; // Ganti dengan gambar kosong
    createExplosionAnimation(row, col); // Tampilkan animasi ledakan untuk Magic Candy
}


function swapCandies(tile1, tile2) {
    let tempSrc = tile1.src;
    tile1.src = tile2.src;
    tile2.src = tempSrc;

    // Tambahkan kelas untuk mengatur animasi saat pertukaran permen
    tile1.classList.add("moving");
    tile2.classList.add("moving");

    tile1.style.transform = "translate(0, 0)";
    tile2.style.transform = "translate(0, 0)";

    // Hapus kelas 'moving' setelah animasi selesai
    setTimeout(function () {
        tile1.classList.remove("moving");
        tile2.classList.remove("moving");
    }, 300); // Animasi berlangsung selama 0.5 detik
}



function dragEnd() {
    currTile.classList.remove("dragging");
    currTile.style.transition = "";
    otherTile.classList.remove("dropped"); // Hapus kelas dropped setelah perpindahan

    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) {
        return;
    }

    let currCoords = currTile.id.split("-");
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = otherTile.id.split("-");
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c - 1 && r == r2;
    let moveRight = c2 == c + 1 && r == r2;
    let moveUp = r2 == r - 1 && c == c2;
    let moveDown = r2 == r + 1 && c == c2;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;

    if (isAdjacent) {
        let currImg = currTile.src;
        let otherImg = otherTile.src;
        currTile.src = otherImg;
        otherTile.src = currImg;

        let validMove = checkValid();
        if (!validMove) {
            // Swap back if the move is not valid
            let temp = currTile.src;
            currTile.src = otherTile.src;
            otherTile.src = temp;

            // Reset animasi jika tidak valid
            setTimeout(function () {
                currTile.classList.remove("dropped");
                otherTile.classList.remove("dropped");
            }, 300); // Tunggu hingga animasi selesai
        }
    }
}




let bombs = []; // Array untuk menyimpan bom yang terbentuk

function crushCandy() {
    const pop1 = document.getElementById("pop1");
    const pop2 = document.getElementById("pop2");

    if (score >= 500 && !jumpscareShown) {
        showJumpscare();   // Panggil fungsi jumpscare
        jumpscareShown = true;  // Tanda bahwa jumpscare sudah muncul
    }

    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < columns - 1; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r + 1][c];
            let candy4 = board[r + 1][c + 1];

            // Cek jika semua empat permen sama
            if (candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === candy4.src && !candy1.src.includes("blank")) {
                // Hancurkan keempat permen
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                candy4.src = "./images/blank.png";
                pop2.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop2.play(); // Mainkan suara pop
                createBomb(r, c); // Buat bom di posisi candy pertama
                score += 40; // Tambah skor untuk 4 permen
                timer += 1;  // Tambah waktu ekstra
                document.getElementById("timer").innerText = timer;
            }
        }
    }
    
    // Cek baris untuk 4 permen
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 3; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            let candy4 = board[r][c + 3];

            // Cek jika keempat permen sama
            if (candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === candy4.src && !candy1.src.includes("blank")) {
                // Hancurkan keempat permen
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                candy4.src = "./images/blank.png";
                pop2.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop2.play(); // Mainkan suara pop
                createMagicCandy(r, c); // Buat bom di posisi candy pertama
                score += 40; // Tambah skor untuk 4 permen
                timer += 1;  // Tambah waktu ekstra
                document.getElementById("timer").innerText = timer;
            }
        }
    }

    // Cek kolom untuk 4 permen
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 3; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            let candy4 = board[r + 3][c];

            // Cek jika keempat permen sama
            if (candy1.src === candy2.src && candy2.src === candy3.src && candy3.src === candy4.src && !candy1.src.includes("blank")) {
                // Hancurkan keempat permen
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                candy4.src = "./images/blank.png";
                pop2.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop2.play(); // Mainkan suara pop
                createMagicCandy(r, c); // Buat bom di posisi candy pertama
                score += 40; // Tambah skor untuk 4 permen
                timer += 1;  // Tambah waktu ekstra
                document.getElementById("timer").innerText = timer;
            }
        }
    }
    // Cek baris untuk 3 permen
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];

            // Cek jika tiga permen sama
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                // Hancurkan ketiga permen
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                pop1.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop1.play(); // Mainkan suara pop
                score += 30; // Tambah skor untuk 3 permen
                timer += 1;  // Tambah waktu ekstra
                document.getElementById("timer").innerText = timer;
            }
        }
    }

    // Cek kolom untuk 3 permen
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];

            // Cek jika tiga permen sama
            if (candy1.src === candy2.src && candy2.src === candy3.src && !candy1.src.includes("blank")) {
                // Hancurkan ketiga permen
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                pop1.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop1.play(); // Mainkan suara pop
                score += 30; // Tambah skor untuk 3 permen
                timer += 1;  // Tambah waktu ekstra
                document.getElementById("timer").innerText = timer;
            }
        }
    }



    // Tampilkan skor yang telah diperbarui
    document.getElementById("score").innerText = score;
}


function createExplosionAnimation(row, col) {
    const explosionImages = [
        "./images/explode1.png",
        "./images/explode2.png",
        "./images/explode3.png"
    ];

    // Create a div for the explosion animation
    const explosionDiv = document.createElement("div");
    explosionDiv.classList.add("explosion-animation");
    document.getElementById("board").appendChild(explosionDiv);

    // Position the explosion at the candy's location
    const tile = board[row][col];
    explosionDiv.style.position = "absolute";
    explosionDiv.style.top = tile.offsetTop + "px";
    explosionDiv.style.left = tile.offsetLeft + "px";

    // Create img elements for the explosion
    explosionImages.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        img.style.position = "absolute";
        img.style.top = "0";
        img.style.left = "0";
        img.style.display = "none"; // Start hidden
        explosionDiv.appendChild(img);

        // Show the image after a delay
        setTimeout(() => {
            img.style.display = "block"; // Show the image
        }, index * 100); // Show each image every 100ms
    });

    // Remove the explosion div after the last image is shown
    setTimeout(() => {
        explosionDiv.remove();
    }, explosionImages.length * 100); // Total duration of the animation
}

function createMagicCandy(row, col) {
    // Ganti dengan gambar magic candy
    board[row][col].src = "./images/magicCandy.png"; // Pastikan Anda memiliki gambar magicCandy.png
    // Panggil fungsi untuk menghancurkan permen di sekitar
    const surroundingCoords = [
        { r: row - 1, c: col }, // Atas
        { r: row + 1, c: col }, // Bawah
        { r: row, c: col - 1 }, // Kiri
        { r: row, c: col + 1 }  // Kanan
    ];

    surroundingCoords.forEach(({ r, c }) => {
        // Pastikan koordinat berada dalam batas
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
            let candy = board[r][c];
            if (!candy.src.includes("blank") && !candy.src.includes("bomb")) {
                // Hancurkan permen yang terkena ledakan
                candy.src = "./images/blank.png"; // Ganti dengan gambar kosong
                score += 20; // Tambah skor untuk setiap permen yang hancur
                createExplosionAnimation(r, c); // Panggil animasi ledakan
            }
        }
    });
}

function createBomb(row, col) {
    bombs.push({ row, col }); // Simpan posisi bom
    board[row][col].src = "./images/bomb.png"; // Ganti dengan gambar bom
}


function explodeBomb(row, col) {
    const bombSurroundingCoords = [
        { r: row - 1, c: col }, // Atas
        { r: row + 1, c: col }, // Bawah
        { r: row, c: col - 1 }, // Kiri
        { r: row, c: col + 1 }, // Kanan
        { r: row - 1, c: col - 1 }, // Atas Kiri
        { r: row - 1, c: col + 1 }, // Atas Kanan
        { r: row + 1, c: col - 1 }, // Bawah Kiri
        { r: row + 1, c: col + 1 }  // Bawah Kanan
    ];

    // Hancurkan permen di sekitar bom
    bombSurroundingCoords.forEach(({ r, c }) => {
        if (r >= 0 && r < rows && c >= 0 && c < columns) {
            let candy = board[r][c];
            if (!candy.src.includes("blank") && !candy.src.includes("bomb")) {
                pop2.currentTime = 0; // Reset waktu untuk memutar ulang suara
                pop2.play(); // Mainkan suara pop
                createExplosionAnimation(r, c);
                candy.src = "./images/blank.png"; // Hancurkan permen yang terkena ledakan
                score += 20; // Tambah skor untuk setiap permen yang hancur
            }
        }
    });

    // Hapus bom dari board
    let bombTile = board[row][col];
    bombTile.src = "./images/blank.png"; // Ganti dengan gambar kosong
    bombTile.isBomb = false; // Atur status bom menjadi false

    // Hapus bom dari array jika diperlukan
    bombs = bombs.filter(b => !(b.row === row && b.col === col));
}

let jumpscareShown = false;  // Variabel penanda apakah jumpscare sudah muncul
let flashInterval;  // Variabel untuk menyimpan interval kelap-kelip

function showJumpscare() {
    if (!jumpscareShown) {  // Hanya tampilkan jika belum pernah muncul
        jumpscareShown = true;  // Tanda jumpscare sudah ditampilkan
        document.getElementById("jumpscare").style.display = "flex";  // Tampilkan jumpscare
        const audio = document.getElementById("jumpscareAudio");
        audio.currentTime = 0; // Mulai dari awal
        audio.play(); // Mainkan suara jumpscare

        // Setelah 1 detik, mulai kelap-kelip
        setTimeout(function () {
            let flashes = 0;

            // Hentikan interval kelap-kelip sebelumnya jika belum dihentikan
            if (flashInterval) {
                clearInterval(flashInterval);
            }

            flashInterval = setInterval(function () {
                // Toggle antara 'block' dan 'none' untuk membuat efek kelap-kelip
                const jumpscareElement = document.getElementById("jumpscare");
                jumpscareElement.style.display =
                    (jumpscareElement.style.display === "flex") ? "none" : "flex";

                flashes += 1;

                // Hentikan kelap-kelip setelah 40 kali (2 detik dengan interval 50ms)
                if (flashes >= 40) {
                    clearInterval(flashInterval);
                    flashInterval = null;
                    document.getElementById("jumpscare").style.display = "none"; // Sembunyikan jumpscare
                }
            }, 50); // Kelap-kelip setiap 50 milidetik
        }, 1000); // Mulai kelap-kelip setelah 1 detik
    }
}

function hideJumpscare() {
    jumpscareShown = false;  // Reset state jumpscare agar bisa muncul lagi di game berikutnya
}


function crushThree() {
    // Check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                score += 30;
                timer += 1;  // Add extra time for each match
                document.getElementById("timer").innerText = timer;
            }
        }
    }

    // Check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                createExplosionAnimation(r, c);
                candy1.src = "./images/blank.png";
                candy2.src = "./images/blank.png";
                candy3.src = "./images/blank.png";
                score += 30;
                timer += 1;
                document.getElementById("timer").innerText = timer;
            }
        }
    }
}

// Check if the move is valid by checking for any matching rows or columns
function checkValid() {
    // Check rows
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = board[r][c];
            let candy2 = board[r][c + 1];
            let candy3 = board[r][c + 2];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    // Check columns
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = board[r][c];
            let candy2 = board[r + 1][c];
            let candy3 = board[r + 2][c];
            if (candy1.src == candy2.src && candy2.src == candy3.src && !candy1.src.includes("blank")) {
                return true;
            }
        }
    }

    return false;
}

// Slide candies down to fill blank spaces
function slideCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1;
        for (let r = rows - 1; r >= 0; r--) {
            if (!board[r][c].src.includes("blank")) {
                board[ind][c].src = board[r][c].src;
                ind -= 1;
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png";
        }
    }
}

// Generate new candies to fill blank spaces at the top
function generateCandy() {
    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) {
            board[0][c].src = "./images/" + randomCandy() + ".png";
        }
    }
}
var config = {
  type: Phaser.AUTO,
  width: 900,
  height: 700,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload() {
 
  this.load.image("sky", "./images/background.png");
  this.load.image("ground", "./images/Platform.jpeg");
  this.load.image("moneda", "./images/moneda.png");
  this.load.image("meteorito", "./images/meteorito.png");
  this.load.spritesheet("dude", "./images/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  // Fondo del juego
  this.add.image(800, 400, "sky");

  // Grupo de plataformas que incluye el suelo y las 2 plataformas en las que podemos saltar
  platforms = this.physics.add.staticGroup();

  // Crear suelo y ajustar su escala para que se ajuste al ancho del juego
  platforms.create(100, 700, "ground").setScale(2).refreshBody();
  platforms.create(900, 700, "ground").setScale(2).refreshBody();

  // Crear algunas plataformas adicionales
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");
  platforms.create(50, 520, "ground");

  // Jugador y sus ajustes
  player = this.physics.add.sprite(100, 450, "dude");

  // Propiedades físicas del jugador, dándole un ligero rebote
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // Animaciones del jugador: izquierda, quieto y derecha
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // Eventos de entrada del teclado
  cursors = this.input.keyboard.createCursorKeys();

  // Estrellas para recolectar
  stars = this.physics.add.group({
    key: "moneda",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    // Dar a cada estrella un rebote ligeramente diferente
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  bombs = this.physics.add.group();

  // Puntuación
  scoreText = this.add.text(16, 16, "SCORE: 0", {
    fontSize: "32px",
    fill: "white",
    fontFamily: "Poppins",
  });

  // Colisiones entre el jugador, las estrellas y las plataformas
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);

  // Verifica si el jugador se superpone con alguna estrella, y si es así, llama a la función collectStar
  this.physics.add.overlap(player, stars, collectStar, null, this);

  this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
  if (gameOver) {
    return;
  }

  // Movimientos del jugador según las teclas presionadas
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  // Salto del jugador si está tocando el suelo y se presiona la tecla de flecha arriba
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);

  // Añadir y actualizar la puntuación
  score += 10;
  scoreText.setText("SCORE: " + score);

  // Generar nuevas estrellas para recolectar
  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    // Crear una bomba en una posición aleatoria
    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, "meteorito");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}

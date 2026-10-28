let bgImage;
let PizzaOrder = [
  "pepperoni",
  "pineapple",
  "green pepper",
  "onions",
  "mushrooms",
  "Olives",
  "Cheese"
  
];
//ticektlist

let pizzaToppings = [[], [], []];

let draggedIngredient = null;
let ingredientSize = 60;

function mousePressed() {
  // Pick up an ingredient image
  for (let i = ingredients.length - 1; i >= 0; i--) {
    let item = ingredients[i];

    if (
      mouseX >= item.x - ingredientSize / 2 &&
      mouseX <= item.x + ingredientSize / 2 &&
      mouseY >= item.y - ingredientSize / 2 &&
      mouseY <= item.y + ingredientSize / 2
    ) {
      draggedIngredient = item;
      break;
    }
  }
}

function mouseDragged() {
  if (draggedIngredient) {
    draggedIngredient.x = mouseX;
    draggedIngredient.y = mouseY;
    redraw();
  }
}






let ingredients = [
  { name: "pepperoni", file: "80-804108_pepperoni-png-pepperoni-transparent-png.png", x: 100, y: 190 },
  { name: "pineapple", file: "pineapple.jpeg", x: 215, y: 190 },
  { name: "green pepper", file: "pepper.jpeg", x: 330, y: 190 },
  { name: "onions", file: "onion.jpeg", x: 445, y: 190 },
  { name: "mushrooms", file: "mushroom.jpeg", x: 560, y: 190 },
  { name: "Olives", file: "olive.jpeg", x: 675, y: 190 },
  { name: "Cheese", file: "cheese.jpeg", x: 790, y: 190 }
];
//ingredient board



function makeRandomOrder() {
  let shuffled = shuffle([...PizzaOrder]);
  let numberOfIngredients = floor(random(3, 5));
  return shuffled.slice(0, numberOfIngredients);
}

let ticket1;
let ticket2;
let ticket3;



async function setup() {
  createCanvas(1280, 720);

 bgImage = await  loadImage('https://static.vecteezy.com/system/resources/previews/016/005/896/non_2x/cartoon-wooden-texture-background-wood-cutting-board-texture-design-brown-wooden-wall-plank-table-or-floor-surface-wooden-cutting-chopping-board-illustration-vector.jpg');   //background

   for (let item of ingredients) {
    item.img = await loadImage(item.file);
    item.startX = item.x;
    item.startY = item.y;
  }
 //ingredient cursor

  noLoop();
  
  ticket1 = makeRandomOrder();
  ticket2 = makeRandomOrder();
  ticket3 = makeRandomOrder();
}

function draw() {
  if(bgImage) {
    background(bgImage);
  }
  else{
  background(200);
  }
  
  fill(192, 192, 192);   //table bar
  rect(50, 130, 800, 120);

  noStroke();
  fill(255, 255, 255);   //ticket
  rect(950,50,300,630);

beginShape();
  vertex(950, 680);
  vertex(950, 710);
  vertex(1050, 680);
  //add more vertex
endShape(CLOSE);

  beginShape();
  vertex(1150, 680);
  vertex(1250, 710);
  vertex(1250, 680);
  //add more vertex
endShape(CLOSE);

  beginShape();
  vertex(1000, 680);
  vertex(1100, 710);
  vertex(1200, 680);
  //add more vertex
endShape(CLOSE);

  beginShape();
  vertex(950, 10);
  vertex(950, 50);
  vertex(1050, 50);
  //add more vertex
endShape(CLOSE);

    beginShape();
  vertex(1000, 50);
  vertex(1100, 10);
  vertex(1200, 50);
  //add more vertex
endShape(CLOSE);

beginShape();
  vertex(1150, 50);
  vertex(1250, 50);
  vertex(1250, 10);
  //add more vertex
endShape(CLOSE);

  fill(252, 248, 200);
  circle(200, 450, 220);  //dough
  circle(450, 450, 220);
  circle(700, 450, 220);
  

  fill(178, 24, 7);
  circle(200, 450, 190); // sauce
  circle(450, 450, 190);
  circle(700, 450, 190);

  for (let pizza of pizzaToppings) {
  for (let topping of pizza) {
    image(topping.img, topping.x - 20, topping.y - 20, 40, 40);
  }
}

  textSize(24);   //ticket text
   fill(0); 
  
  text("TICKET 1: \n" +ticket1.join("\n "), 1000, 80);
  text("TICKET 2: \n" +ticket2.join("\n "), 1000, 300);
  text("TICKET 3: \n" +ticket3.join("\n "), 1000, 550);

  fill(255, 255, 255);
  text("Pizza 1", width - 740 - 380, 330);
  text("Pizza 2", width - 490 - 380, 330);
  text("Pizza 3", width - 240 - 380, 330);

  for (let item of ingredients) {
  image(item.img, item.x - 30, item.y - 30, 60, 60);
}

    
  }

function mouseReleased() {
  if (!draggedIngredient) return;

  let pizzas = [
    { x: 200, y: 450, ticket: ticket1, index: 0 },
    { x: 450, y: 450, ticket: ticket2, index: 1 },
    { x: 700, y: 450, ticket: ticket3, index: 2 }
  ];

  for (let pizza of pizzas) {
    if (dist(mouseX, mouseY, pizza.x, pizza.y) < 110) {
      if (pizza.ticket.includes(draggedIngredient.name)) {
        pizzaToppings[pizza.index].push({
          name: draggedIngredient.name,
          img: draggedIngredient.img,
          x: mouseX,
          y: mouseY
        });
      }
      break;
    }
  }

  draggedIngredient.x = draggedIngredient.startX;
  draggedIngredient.y = draggedIngredient.startY;
  draggedIngredient = null;
  redraw();
}
  





  


  

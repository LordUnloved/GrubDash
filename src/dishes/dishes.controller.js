const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

//validattion begins here
function dishExists(req, res, next) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}

function dishIdIsValid(req, res, next) {
  const {
    data: { id },
  } = req.body;
  const dishId = req.params.dishId;
  if (!id || dishId === id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function dishHasPricing(req, res, next) {
  const {
    data: { price },
  } = req.body;

  if (!price) {
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }

  res.locals.price = price;
  next();
}

function priceIsValid(req, res, next) {
  const price = res.locals.price;
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: `Dish must have valid price greater than 0`,
    });
  }
  next();
}

function dishImageIsValid(req, res, next) {
  const {
    data: { image_url },
  } = req.body;

  if (!image_url || image_url === "") {
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }

  res.locals.image_url = image_url;
  next();
}

function dishIsNamed(req, res, next) {
  const {
    data: { name },
  } = req.body;

  if (!name || name === "") {
    next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  res.locals.name = name;
  next();
}

function hasDescription(req, res, next) {
  const {
    data: { description },
  } = req.body;

  if (!description || description === "") {
    next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  res.locals.description = description;
  next();
}


//  ROUTES

function create(req, res) {
  const {
    data: { name, description, price, image_url },
  } = req.body;
  const id = nextId();
  const newDish = {
    id,
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}


function read(req, res) {
  res.json({ data: res.locals.dish });
}
//update a dish 
function update(req, res) {
  const dish = res.locals.dish;
  const { name, description, price, image_url } = res.locals;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

//will list all dishes
function list(req, res) {
  res.json({ data: dishes });
}

module.exports = {
  create: [
    dishIsNamed,
    hasDescription,
    dishHasPricing,
    priceIsValid,
    dishImageIsValid,
    create,
  ],
  update: [
    dishExists,
    dishIdIsValid,
    dishIsNamed,
    hasDescription,
    dishHasPricing,
    priceIsValid,
    dishImageIsValid,
    update,
  ],
  read: [dishExists, read],
  list,
};

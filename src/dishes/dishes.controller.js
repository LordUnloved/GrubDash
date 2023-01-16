const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

//validattion begins here
///checking whether dish exists
function dishExists(req, res, next) {
  const dishId = req.params.dishId;///extracting id
  const found = dishes.find((dish) => dish.id === dishId); ///using .find to compare dish id to ids in data

  if (found) { ///if found dish is truthy store it in local memory
    res.locals.dish = found;
    return next();
  } ///else return error code
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`,
  });
}
///validating dish Id
function dishIdIsValid(req, res, next) {
  const { data: { id }, } = req.body; 
  const dishId = req.params.dishId; ///extracting dish id
  if (!id || dishId === id) { ///if id matches return next else error message
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}
///checking for price
function dishHasPricing(req, res, next) {
  const { data: { price }, } = req.body;

  if (!price) { ///if no price return error message
    next({
      status: 400,
      message: "Dish must include a price",
    });
  }

  res.locals.price = price; ///else store price in local memory
  next();
}
///validating price
function priceIsValid(req, res, next) {
  const price = res.locals.price; ///retriving price from local memory
  if (price <= 0 || !Number.isInteger(price)) { ///if price is less than equal to zero or NaN return error code
    next({
      status: 400,
      message: `Dish must have valid price greater than 0`,
    });
  }
  next();
}
///checking for valid image
function dishImageIsValid(req, res, next) {
  const { data: { image_url }, } = req.body;

  if (!image_url || image_url === "") { ///if not an image url or if empty string return erro code
    next({
      status: 400,
      message: "Dish must include a image_url",
    });
  }

  res.locals.image_url = image_url; ///else store in local memory
  next();
}
///checking for a name "WE NEED A NAME" ///
function dishIsNamed(req, res, next) {
  const { data: { name }, } = req.body;

  if (!name || name === "") { ///if not name or is empty string return err mesaage
    next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  res.locals.name = name; ///once valid, store it in local memory
  next();
}
///checking for valind description
function hasDescription(req, res, next) {
  const { data: { description }, } = req.body;

  if (!description || description === "") { ///if not truthy description or empty string , return err 
    next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  res.locals.description = description; ///store in local memory
  next();
}


///<-----ROUTES------>////
//CRUD begns here, CREATE, READ, UPDATE, DESTROY
//Create a dish
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

const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

///validation begins here
function orderExists(req, res, next) {
  const { orderId } = req.params;
  const currOrder = orders.find((order) => order.id === orderId);
  if (currOrder) {
    res.locals.order = currOrder;
    return next();
  }
  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

//check to see if parameter property is an Id
function orderIdisValid(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;
  if (id === "" || !id) {
    return next();
  }
  if (id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    });
  }
  next();
}

///checking for address
function hasAddress(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo !== "") {
    return next();
  }
  next({ status: 400, message: "Order must include a deliverTo" });
}

///checking for mobile
function hasValidMobile(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber !== "") {
    return next();
  }
  next({ status: 400, message: "Order must include a mobileNumber" });
}

function hasDishes(req, res, next) {
  const { data: { dishes } = [] } = req.body;
  const isArray = Array.isArray(dishes);//static method determines whether the passed value is an Array then returs error
  if (!dishes) {
    return next({ status: 400, message: "Order must include a dish" });
  } else if (dishes.length === 0 || !isArray) {
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  }
  next();
}

function hasValidQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  let error = null;
  dishes.forEach((dish) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      error = {
        status: 400,
        message: `Dish ${dishes.indexOf(
          dish
        )} Dish quantity must be greater than 0`,
      };
    }
  });
  if (error) {
    return next(error);
  }
  next();
}

function hasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status && status !== "") {
    return next();
  }
  next({
    status: 400,
    message:
      "Order must have status",
  });
}

function validateStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];

  if (!validStatuses.includes(status)) {
    return next({ status: 400, message: "Invalid status" });
  }

  if (status === "delivered") {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }

  next();
}

//CRUD begns here
function create(req, res, next) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}


function list(req, res, next) {
  res.json({ data: orders });
}


function update(req, res, next) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } =
    req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

function destroy(req, res, next) {
  const order = res.locals.order;
  const index = orders.indexOf(order);
  if (!order) {
    return next({ status: 404, message: "Order not found." });
  }
  if (order.status !== "pending") {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending.",
    });
  }
  if (index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

module.exports = {
  create: [hasAddress, hasValidMobile, hasDishes, hasValidQuantity, create],
  read: [orderExists, read],
  update: [
    orderExists,
    orderIdisValid,
    hasStatus,
    validateStatus,
    hasAddress,
    hasValidMobile,
    hasDishes,
    hasValidQuantity,
    update,
  ],
  delete: [orderExists, destroy],
  list,
};
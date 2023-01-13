const { response } = require("express");
const path = require("path");
// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));
// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

///validation begins here
function bodyHasData(prop){
    return function (req, res, next){
        const { data } = req.body;
        const propster = data[prop];

        if(prop === "id"){ //check to see if parameter property is an Id
            if(propster){   // then if the data exists 
                if(propster != req.params.orderId){ //if property is not a match return error code
                    next({
                        status: 400,
                        message: `Order id does not match route id. Order id: ${propster}`
                    })
                }
            }
            return next();
        }

        if(prop === "status"){ //checking for invalid status code
            if( !propster ||  propster === "" || propster === "invalid"){
                return next({
                    status: 400,
                    message: `Missing ${prop}. Please complete all fields.`
                })
            }
        }

        if(prop === "dishes"){ //checking if dish
            if(!Array.isArray(propster)){//reveerse static method determines whether the passed value is not an Array
                return next({
                    status: 400,
                    message: `Missing ${prop}. Please complete all fields`
                })
            }
            if(propster.length === 0){
                return next({
                    status: 400,
                    message: `Missing ${prop}. Please complete all fields`
                })
            }
            const index = propster.findIndex( order => {
                return !order.quantity || order.quantity <= 0 || typeof order.quantity !== "number"
            })
            if(index > -1){
                return next({
                    status: 400,
                    message: `Dish ${index} quantity must be greater than 0`
                })
            }
        }
        if( !propster ||  propster === ""){
            return next({
                status: 400,
                message: `Missing ${prop}. Please complete all fields`
            })
        }
        return next();
    }
}

//CRUD begns here

function create (req, res){
    const { data } = req.body;
    const id = nextId();
    const newOrder = {
        ...data,
        id: id
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder })
}

function orderExists (req, res, next){
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id === orderId);
    if(foundOrder){
        res.locals.order = foundOrder;
        return next();
    }
    return next({
        status: 404,
        message: `Order ${orderId} does not exist`
    });
}

function read (req, res){
    res.json({ data: res.locals.order })
}

function update (req, res, next){
    const order = res.locals.order;
    if( order.status === "delivered"){
        return next({
            status: 400,
            message: "Order delivered."
        })
    }
    const { data: {deliverTo, mobileNumber, status, dishes }} = req.body;


    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({data: order})
}

function destroy (req, res, next){
    const foundOrder = res.locals.order;
    if(foundOrder.status !== "pending"){
        next({
            status: 400,
            message: "A pending order cannot be deleted."
        })
    }
    const index = orders.findIndex( order => order.id == foundOrder.id);
    if(index > -1){
        orders.splice(index, 1);
    }
    res.sendStatus(204)
}

function list (req, res){
    return res.json({ data: orders })
}

module.exports = {
    create: [
        bodyHasData("deliverTo"),
        bodyHasData("mobileNumber"),
        bodyHasData("dishes"),
        create
    ],
    read: [orderExists, read],
    update: [
        orderExists,
        bodyHasData("deliverTo"),
        bodyHasData("mobileNumber"),
        bodyHasData("dishes"),
        bodyHasData("status"),
        bodyHasData("id"),
        update
    ],
    delete: [orderExists, destroy],
    list
}

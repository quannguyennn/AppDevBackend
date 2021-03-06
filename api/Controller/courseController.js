const express = require("express");
const Router = express.Router;
const courseApiRouter = Router();
const courseModel = require("../Model/courseModel");
//CREATE
courseApiRouter.post("/", (req, res) => {
    const {name, topic, trainer} = req.body;
    let found = false;
    courseModel.find({name: name})
    .then(() => found = true)
    .catch(err => console.log(err))

    if(found){
        res.status(401).send({success: 0, message: "Name is taken"})
    } else {
        courseModel.create({name, topic, trainer})
        .then(createdCourse => {
            res.status(200).send({success: 1, data: createdCourse})
        })
        .catch(err => res.status(500).send({success: 0, message: err}))
    }
})
//READ
//READ ALL
courseApiRouter.get("/", (req, res) => {
    courseModel.find({})
        .select("-__v")
        .populate("trainer users", "-__v -password -role")
        .populate("trainee users", "-__v -password -role")
        .then(courses => res.status(200).send({success: 1, data: courses}))
        .catch(err => res.status(500).send({success: 0, message: err}))
})

//READ BY ID
courseApiRouter.get("/:id", (req, res) => {
    courseModel.findOne({_id : req.params.id}).select("-__v")
        .populate("trainer users", "-__v -password -role -course")
        .populate("trainee users", "-__v -password -role -course")
        .then(course => res.status(200).send({success: 1, data: course}))
        .catch(err => res.status(500).send({success: 0, message: err}))

})

courseApiRouter.get("/trainer/:id", (req, res) => {
    userModel.findOne({_id: req.params.id}).select("-__v -password -course -role")
    .then(trainer => {
        console.log(trainer)
        courseModel.find({trainer: trainer}).select("-__v")
        .populate("trainer users", "-__v -password -course -role")
        .populate("trainer users", "-__v -password -course -role")
        .then(courses => {
            console.log(courses)
            res.status(200).send({success: 1, data: courses})
        })
        .catch(err => res.status(500).send({success: 0, message: err}))
    })
    .catch(err => res.status(500).send({success: 0, message: err}))
    
})

 

//UPDATE
//Add more trainee
courseApiRouter.put("/:id", (req, res) => {
    console.log(req.body.trainee)
    courseModel.findOne({_id : req.params.id})
    .then(course => {
        let trainees = course.trainee;
        for (var i = 0; i < req.body.trainee.length; i ++){
            trainees.push(req.body.trainee[i])
        }
        courseModel.updateOne(
            {_id: req.params.id},
            {   
                name: req.body.name,
                topic: req.body.topic,
                trainer: req.body.trainer,
                trainee: trainees
            })
            .then(()=> res.status(200).send({success: 1, trainer: course.trainer, trainee: trainees}))
    })
    .catch(err => res.status(500).send({success: 0, message: err}))
})
//Add to calendar
courseApiRouter.put("/:id/calendar", (req, res) => {
    console.log("ID", req.params.id)
    courseModel.findOne({_id: req.params.id})
    .then(course => {
        console.log("course: ", course)
        let calendars = course.calendar
        calendars.push({
            date: req.body.date,
            info: req.body.info
        })
        courseModel.update(
            {_id: req.params.id},
            {calendar: calendars}
        )
        .then(() => res.status(200).send({success: 1}))
    }).catch(err => res.status(500).send({success: 0, message: err}))
})
//DELETE
courseApiRouter.delete("/:id", (req, res) => {
    courseModel.deleteOne({_id: req.params.id})
    .then(() => {
        courseModel.find({})
        .select("-__v")
        .populate("trainer users", "-__v -password -role")
        .populate("trainee users", "-__v -password -role")
        .then(courses => res.status(200).send({success: 1, data: courses}))
        .catch(err => res.status(500).send({success:0 , message: err}))
    })
    .catch((err) => {
        res.status(500).send({success: 0})
    })
})


module.exports = courseApiRouter;
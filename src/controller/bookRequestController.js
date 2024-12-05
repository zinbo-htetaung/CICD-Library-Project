const model = require("../models/bookRequestModel");



module.exports.retrieveAllBookRequests=(req,res,next)=>{
    model.retrieveAll()
    .then(requests=>{
        if(requests.length==0){
            return res.status(404).json({message:"No request found"})
        }
        return res.status(200).json({requests:requests});
    })
    .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    });
}

module.exports.retrieveBookRequestByUserId=(req,res,next)=>{
    if(!res.locals.user_id ){
        return res.status(400).json({message: "Necessary data is missing" })
    }
    const data={
        user_id:res.locals.user_id 
    }
    model.retrieveByUserId(data)
    .then(requests=>{
        if(requests.length==0){
            return res.status(404).json({message:"No request found"})
        }
        return res.status(200).json({requests:requests});
    })
    .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    });
}

module.exports.createRequestByUserId=(req,res,next)=>{
    if(!res.locals.user_id ){
        return res.status(400).json({message: "Necessary data is missing" })
    }
    if(!req.body.book_name){
        return res.status(400).json({message: "Book name is required at least" })
    }
    const data={
        user_id:res.locals.user_id ,
        book_name:req.body.book_name,
        author:req.body.author || null
    }
    model.createByUserId(data)
    .then(requests=>{
        return res.status(201).json({message: "Book request created successfully" })
    })
    .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    });
}

module.exports.deleteRequestByRequestId=(req,res,next)=>{
    if(!req.body.request_id){
        return res.status(400).json({message: "Necessary data is missing" })
    }
    const data={
        request_id:req.body.request_id
    }
    model.deleteById(data)
    .then(requests=>{
        return res.status(200).json({message: "Book request deleted successfully" })
    })
    .catch(function (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    });
}

module.exports.retrieveFilteredBookRequests = (req, res, next) => {
    const filter  = req.body;
    console.log(filter)
    if (!filter || typeof filter !== 'object') {
        return res.status(400).json({ message: "Filter data is required and must be an object" });
    }

    model.retrieveFiltered(filter)
        .then(requests => {
            if (requests.length == 0) {
                
                return res.status(404).json({ message: "No matching requests found" });
            }
        console.log(requests)
            return res.status(200).json({ requests: requests });
        })
        .catch(function (error) {
            console.error(error);
            return res.status(500).json({ error: error.message });
        });
};
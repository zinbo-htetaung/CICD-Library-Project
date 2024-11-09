const prisma = require('./prismaClient');
module.exports.retrieveAll=async()=>{
    return await prisma.book_request.findMany()
    .then(requests=>{
        console.log(requests)
        return requests;
    })
    .catch(error=> {
        console.error(error);
        
    });
}

module.exports.retrieveByUserId=async(data)=>{
    return await prisma.book_request.findMany({
        where:{
            user_id:data.user_id
        }
    })
    .then(books=>{
        console.log(books)
        return books;
    })
    .catch(error=> {
        console.error(error);
        
    });
}

module.exports.createByUserId=async(data)=>{
    return await prisma.book_request.create({
        data:{
            user_id: data.user_id,
            author: data.author,
            book_name: data.book_name
        }
    })
}

module.exports.deleteById=async(data)=>{
    return await prisma.book_request.delete({
        where:{
            id:data.request_id
        }
    })
}
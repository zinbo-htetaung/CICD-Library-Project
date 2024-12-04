const prisma = require('./prismaClient');
module.exports.retrieveAll = async () => {
    return await prisma.book_request.findMany({
        include: {
            users: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    .then(requests => {
        return requests.map(request => ({
            id: request.id,
            book_name: request.book_name,
            author: request.author,
            requested_on: request.requested_on,
            user_id: request.users.id,
            user_name: request.users.name
        }));
    })
    .catch(error => {
        console.error(error);
    });
};


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
            id:parseInt(data.request_id,10)
        }
    })
}
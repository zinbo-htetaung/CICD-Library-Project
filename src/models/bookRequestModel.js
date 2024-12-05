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


module.exports.retrieveFiltered = async (filter) => {
    const where = {};

    // Filtering by user_id if present
    if (filter.user_id) {
        where.user_id = parseInt(filter.user_id, 10); // Ensure user_id is treated as an integer
    }

    // Filtering by date range if start_date and end_date are provided
    if (filter.start_date && filter.end_date) {
        where.requested_on = {
            gte: new Date(filter.start_date), // greater than or equal to start_date
            lte: new Date(filter.end_date) // less than or equal to end_date
        };
    }

    return await prisma.book_request.findMany({
        where: where,
        include: {
            users: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: filter.sort_order ? { requested_on: filter.sort_order } : undefined // Sorting if sort_order is provided
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
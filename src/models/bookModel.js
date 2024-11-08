const prisma = require('./prismaClient');
module.exports.retrieveAll=async()=>{
    return await prisma.book.findMany()
    .then(books=>{
        console.log(books)
        return books;
    })
    .catch(error=> {
        console.error(error);
        
    });
}
module.exports.searchByName=async(data)=>{
    return await prisma.book.findMany({
        where:{
            book_name:{
                contains:data.bookName,
                mode:'insensitive'
            }
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

module.exports.searchByAuthor=async(data)=>{
    return await prisma.book.findMany({
        where:{
            author:{
                contains:data.authorName,
                mode:'insensitive'
            }
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

module.exports.searchByCategory=async(data)=>{
    return await prisma.book.findMany({
        where: {
            book_category: {
              some: {
                category: {
                    category_name: {
                    contains: data.categoryName,
                    mode: 'insensitive'
                  }
                }
              }
            }
          },
          include: {
            book_category: {
              include: {
                category: true
              }
            }
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
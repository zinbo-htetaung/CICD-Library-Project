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

module.exports.insertSingle = function insertSingle(data) {
    console.log("Data being inserted:", data);
    return prisma.book.create({
        data: {
            book_name: data.book_name,
            author: data.author,
            description: data.description,
            no_of_copies: data.copies,       
            available_copies: data.copies    
        }
    })
    .then(book => {
        console.log(book);
        return book;
    })
    .catch(error => {
        console.error(error);
    });
};

module.exports.checkBookExists = function checkBookExists(book_name, author) {
    return prisma.book.findFirst({
        where: {
            book_name: book_name,
            author: author
        }
    });
};

module.exports.updateSingle = function updateSingle(data) {
    return prisma.book.update({
        where: {
            id: parseInt(data.id, 10), 
        },
        data: {
            book_name: data.book_name,
            author: data.author,
            description: data.description,
            no_of_copies: data.copies,
            available_copies: data.copies
        }
    })
    .then(book => {
        console.log(book);
        return book;
    })
    .catch(error => {
        if (error.code === 'P2025') {
            throw new Error('Book not found');
        }
        throw error; 
    });
};

module.exports.deleteSingle = function deleteSingle(id) {
    return prisma.book.delete({
        where: { id: parseInt(id, 10) }
    })
    .catch(error => {
        if (error.code === 'P2025') {
            throw new Error('Book not found');
        }
        throw error; 
    });
};

module.exports.retrieveSingle = function retrieveSingle(id) {
    return prisma.book.findUnique({
        where: { id: parseInt(id, 10) } 
    })
    .then(book => {
        if (!book) {
            throw new Error('Book not found');
        }
        return book;
    });
};
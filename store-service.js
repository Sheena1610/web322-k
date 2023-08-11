const Sequelize = require('sequelize');

var sequelize = new Sequelize('kgjjuqzw', 'kgjjuqzw', 'ndx5iQ4rL1ZlGcM-vXTiFS7i3jceOlgt', {
  host: 'stampy.db.elephantsql.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});




const Item = sequelize.define('Item', {
  body: Sequelize.TEXT,
  title: Sequelize.STRING,
  postDate: Sequelize.DATE,
  featureImage: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
  price: Sequelize.DOUBLE
});

const Category = sequelize.define('Category', {
  category: Sequelize.STRING
});

Item.belongsTo(Category, {
  foreignKey: 'category',
});

Category.hasMany(Item);

function initialize() {
  return sequelize.sync()
    .then(() => {
      console.log('Database and tables synchronized successfully.');
    })
    .catch(err => {
      console.error('Unable to sync the database:', err);
      throw new Error('Unable to sync the database.');
    });
}

function getAllItems() {
  return Item.findAll()
    .then(items => {
      return items;
    })
    .catch(err => {
      console.error('Error retrieving all items:', err);
      throw new Error('No results returned');
    });
}

function getItemsByCategory(category) {
  return Item.findAll({
    where: {
      category: category
    }
  })
    .then(items => {
      return items;
    })
    .catch(err => {
      console.error('Error retrieving items by category:', err);
      throw new Error('No results returned');
    });
}

function getItemsByMinDate(minDateStr) {
  return Item.findAll({
    where: {
      postDate: {
        [Sequelize.Op.gte]: new Date(minDateStr)
      }
    }
  })
    .then(items => {
      return items;
    })
    .catch(err => {
      console.error('Error retrieving items by min date:', err);
      throw new Error('No results returned');
    });
}

function getItemById(id) {
  return Item.findAll({
    where: {
      id: id
    }
  })
    .then(items => {
      return items[0];
    })
    .catch(err => {
      console.error('Error retrieving item by ID:', err);
      throw new Error('No results returned');
    });
}

function addItem(itemData) {
  itemData.published = itemData.published ? true : false;

  for (const key in itemData) {
    if (itemData.hasOwnProperty(key) && itemData[key] === "") {
      itemData[key] = null;
    }
  }

  itemData.postDate = new Date();

  return Item.create(itemData)
    .then(() => {
      console.log('Item added successfully.');
    })
    .catch(err => {
      console.error('Error adding item:', err);
      throw new Error('Unable to create post.');
    });
}

function getPublishedItems() {
  return Item.findAll({
    where: {
      published: true
    }
  })
    .then(items => {
      return items;
    })
    .catch(err => {
      console.error('Error retrieving published items:', err);
      throw new Error('No results returned');
    });
}

function getPublishedItemsByCategory(category) {
  return Item.findAll({
    where: {
      published: true,
      category: category
    }
  })
    .then(items => {
      return items;
    })
    .catch(err => {
      console.error('Error retrieving published items by category:', err);
      throw new Error('No results returned');
    });
}

function getCategories() {
  return Category.findAll()
    .then(categories => {
      return categories;
    })
    .catch(err => {
      console.error('Error retrieving categories:', err);
      throw new Error('No results returned');
    });
}

function addCategory(categoryData) {
  for (const key in categoryData) {
    if (categoryData.hasOwnProperty(key) && categoryData[key] === "") {
      categoryData[key] = null;
    }
  }

  return Category.create(categoryData)
    .then(() => {
      console.log('Category added successfully.');
    })
    .catch(err => {
      console.error('Error adding category:', err);
      throw new Error('Unable to create category.');
    });
}

function deleteCategoryById(id) {
  return Category.destroy({
    where: {
      id: id
    }
  })
    .then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        throw new Error('Category not found.');
      }
      console.log('Category deleted successfully.');
    })
    .catch(err => {
      console.error('Error deleting category:', err);
      throw new Error('Unable to delete category.');
    });
}

function deletePostById(id) {
  return Post.destroy({
    where: {
      id: id
    }
  })
    .then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        throw new Error('Post not found.');
      }
      console.log('Post deleted successfully.');
    })
    .catch(err => {
      console.error('Error deleting post:', err);
      throw new Error('Unable to delete post.');
    });
}

function deletePostById(id) {
  return Post.destroy({ where: { id } });
}


module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getPublishedItemsByCategory,
  getCategories,
  addItem,
  getItemById,
  getItemsByCategory,
  getItemsByMinDate,
  addCategory,
  deletePostById,
};

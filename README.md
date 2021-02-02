# material-manager
simple handling of materials, ingredients and recipes

A simple tool to create material categories, that will contain ingredients.
Each ingredient can have any amount of user defined properties.
Those ingredients can be then bundled in to create a recipe.
The recipe will link to each ingredient and its category.
Recipes, ingredients and categories can of course be changed/deleted.

The entered data is first saved into browser local storage, but can be of course manually saved into a JSON file.
On page load the data are first fetched from browser local storage, but you can again load the data manually from previously saved JSON file.

Known bugs/issues:

  - Currently you can't delete a material category with zero ingredients (workaround is to create an ingredient and then delete the category).
  - Material categories, ingredients or recipes cannot be renamed yet (workaround is to delete and re-create, but that's a no go if your category/ingredient/recipe has a lot of ingredients/properties).
  - Even if you don't create anything, you are still able to save an empty JSON.

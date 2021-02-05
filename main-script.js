//localStorage.removeItem('data');

//Event listeners
document.querySelector('body').onload = loadItems();
document.getElementById('save-data').addEventListener('click', saveData);
document.getElementById('add-category').addEventListener('click', addIngredientCategory);
document.getElementById('save-ingredient').addEventListener('click', addIngredientItem);
document.getElementById('add-ingredient-property').addEventListener('click', addTextbox);
document.getElementById('add-ingredient-comment').addEventListener('click', addCommentBox);
document.getElementById('create-recipe').addEventListener('click', createRecipe);
document.getElementById('load-data').addEventListener('change', loadData);

//Main data container to be saved and loaded with each open/close
//index 0:  Ingredient categories
//index 1:  Ingredient items
//index 2:  Recipe data
var data;
if (JSON.parse(localStorage.getItem('data')) == null)
{
    data = [[],[],[]];
}
else
{
    data = JSON.parse(localStorage.getItem('data'));
}

var nrOfProperties = 0;

function loadData()
{
    var importedJson = document.getElementById('load-data').files[0];
    var reader = new FileReader();
        reader.onload = function()
        {
            var jsonContent = JSON.parse(reader.result);
            console.log('Read file: ', jsonContent);
            localStorage.setItem('data', JSON.stringify(jsonContent));
            document.getElementById('progress-bar').style.animationName = 'loading';
            document.getElementById('data-loader').style.animationName = 'show-loader';
            loadItems();
        };
        reader.readAsText(importedJson);
}

function saveData()
{
    var a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([localStorage.getItem('data', JSON.stringify(data, null, 2))], {type: 'text/plain'}));
            a.setAttribute('download', 'data.json');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
}

function loadJson(callback)
{
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType('application/json');
        xobj.open('GET', 'data.json', true);
        xobj.onreadystatechange = function ()
        {
            if (xobj.readyState == 4 && xobj.status == '200')
            {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
}

function loadItems()
{
    data = JSON.parse(localStorage.getItem('data'));
    if (data == null)
    {
        return false;
    }
    else
    {
        buildPage(data);
        timeout();
        localStorage.setItem('data', JSON.stringify(data));
    }
    for (y = 0; y < data[0].length; y++)
    {
        if (data[0][y].Deleted != true)
        {
            var container = document.getElementById("tree-struct");
            var li = document.createElement("li");
                li.id = "list--" + fixWhiteSpace(data[0][y].Name);
            var liText = document.createTextNode(data[0][y].Name);
            var span = document.createElement("span");
                span.className = "caret";
            var ul = document.createElement("ul");
                ul.className = "nested";
            container.appendChild(li);
                li.appendChild(span);
                    span.appendChild(liText);
                li.appendChild(ul);
        }
        else
        {
            continue;
        }
        
    }
    
    for (q = 0; q < data[1].length; q++)
    {
        if (document.getElementById("list--" + fixWhiteSpace(data[1][q].Category)) != null && data[1][q].Deleted != true)
        {
            var listContainer = document.getElementById("list--" + fixWhiteSpace(data[1][q].Category)).childNodes[1];
            var listItemName = data[1][q].Name;
            var subLi = document.createElement("li");
                subLi.id = fixWhiteSpace(listItemName);
            var subLiText = document.createTextNode(listItemName);
            var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "form-check-input";
                checkbox.value = fixWhiteSpace(listItemName);
                checkbox.checked = false;

            listContainer.appendChild(subLi);
                subLi.appendChild(checkbox);
                subLi.appendChild(subLiText);
        }
        else
        {
            continue;
        }
        
    }
}

function buildPage(data)
{
    //Build ingredient categories and populate option box in ingredient item modal
    var selectCategoryContainer = document.getElementById('category-options');
    for (i = 0; i < data[0].length; i++)
    {
        if (data[0][i].Deleted != true)
        {
            //Build ingredient categories
            generateBox(fixWhiteSpace(data[0][i].Name), data[0][i].Name, 'ingredient-side', 'category');
            //Populate select box in Add ingredient item modal
            var option = document.createElement('option');
            var optionValue = document.createTextNode(data[0][i].Name);
            selectCategoryContainer.appendChild(option);
            option.appendChild(optionValue);
        }
        else
        {
            continue;
        }
        
    }
    for (z = 0; z < data[2].length; z++)
    {
        
        if (data[2][z].Deleted != true)
        {
            generateBox(fixWhiteSpace(data[2][z].Name), data[2][z].Name, 'recipe-side', 'recipe');
            fillRecipe('recipe--' + fixWhiteSpace(data[2][z].Name), data[2][z]);
        }
    }

    //Build ingredient items
    for (x = 0; x < data[1].length; x++)
    {
        if (data[1][x].Deleted != true)
        {
            generateBox(fixWhiteSpace(data[1][x].Name), data[1][x].Name, 'category--' + fixWhiteSpace(data[1][x].Category), 'ingredient');
            buildTable(fixWhiteSpace(data[1][x].Name), data[1][x]);
        }
    }
}

function addIngredientCategory()
{
    var categoryName = document.getElementById('ingredient-category-name').value;
    
    if (categoryName == '')
    {
        document.getElementById('ingredient-category-name').placeholder = 'Category name missing!';
        document.getElementById('ingredient-category-name').style.outline = "3px solid #fcc";
        return false;
    }
    var input = {
        Name: categoryName,
        Deleted: false
    };
    data[0].push(input);
    localStorage.setItem('data', JSON.stringify(data));
    location.reload();
}

function addIngredientItem()
{
    var ingredientName = document.getElementById('ingredient-item-name').value;
    var ingredientCategory = document.getElementById('category-options').value;
    var ingredientDescription;
    if (ingredientName == '')
    {
        document.getElementById('ingredient-item-name').placeholder = 'Category name missing!';
        document.getElementById('ingredient-item-name').style.outline = "3px solid #fcc";
        return false;
    }
    if (document.getElementById('ingredient-comment') == null)
    {
        ingredientDescription = 'deleted';
    }
    else
    {
        if (document.getElementById('ingredient-comment').value != '')
        {
            ingredientDescription = document.getElementById('ingredient-comment').value;
        }
        else
        {
            document.getElementById('ingredient-comment').placeholder = 'Comment missing!';
            document.getElementById('ingredient-comment').style.outline = "3px solid #fcc";
            return false;
        }
    }
    var parent = document.getElementById('property-box');
    var child = parent.childNodes;
    var propNames = [];
    var propVals = [];
    for (i = 0; i < child.length; i++)
    {
        if (child[i].nodeName == 'INPUT' && child[i].id.includes('name') == true)
        {
            if (child[i].value != '')
            {
                propNames.push(child[i]);
            }
            else
            {
                child[i].placeholder = 'Property name missing!';
                child[i].style.outline = '3px solid #fcc';
                return false;
            } 
        }
        else if (child[i].nodeName == 'INPUT' && child[i].id.includes('value') == true)
        {
            if (child[i].value != '')
            {
                propVals.push(child[i]);
            }
            else
            {
                child[i].placeholder = 'Property value missing!';
                child[i].style.outline = '3px solid #fcc';
                return false;
            }   
        }  
    }
    var input = {
        Category: ingredientCategory,
        Deleted: false,
        Name: ingredientName,
        Description: ingredientDescription        
    };

    for (x = 0; x < propVals.length; x++)
    {
        input[propNames[x].value] = propVals[x].value;
    }
    data[1].push(input);
    localStorage.setItem('data', JSON.stringify(data));
    location.reload();
}

function addTextbox()
{
    nrOfProperties++;
    var propertyName = document.createElement("input");
    propertyName.type = "text";
    propertyName.id = "property-name" + nrOfProperties;
    propertyName.placeholder = "Property name";
    propertyName.className = "form-control form-control-sm";
    var propertyValue = document.createElement("input");
    propertyValue.type = "text";
    propertyValue.id = "property-value" + nrOfProperties;
    propertyValue.placeholder = "Property value";
    propertyValue.className = "form-control form-control-sm";
    var propertyContainer = document.getElementById('property-box');
    propertyContainer.appendChild(propertyName);
    propertyContainer.appendChild(propertyValue);   
}

function addCommentBox ()
{
    var commentBox = document.createElement("textarea");
    commentBox.rows = "4";
    commentBox.id = "ingredient-comment";
    commentBox.placeholder = "Type your comment / description / ...";
    commentBox.className = "form-control";
    var propertyContainer = document.getElementById('property-box');
    propertyContainer.appendChild(commentBox); 
}

function removeAllChildNodes(parent) 
{
    while (parent.firstChild)
    {
        parent.removeChild(parent.firstChild);
    }
}

function fixWhiteSpace(string)
{
    if (string.includes(' ') == false && string.includes('_') == false)
    {
        string = string;
    }
    else if (string.includes(' '))
    {
        string = string.replaceAll(' ', '_');
    }
    else if (string.includes('_'))
    {
        string = string.replaceAll('_', ' ');
    }
    return string;
}

function buildTable(appendingId, input)
{
    var dataArray = Object.entries(input).splice(3);
    var appendTo = document.getElementById('ingredient--' + appendingId);
    if (appendTo == null)
    {
        return false;
    }
    var table = document.createElement("table");
        table.className = 'table';
    appendTo.appendChild(table);

    for (i = 0; i < dataArray.length; i++)
    {
        if (dataArray[i][1] != 'deleted')
        {
        var tr = document.createElement("tr");
            tr.id = dataArray[i][0] + "--" + appendingId;
            table.appendChild(tr);
        var tdName = document.createElement("td");
        var tdVal = document.createElement("td");
        var tdActions = document.createElement("td");
        var buttonGroup = document.createElement("div");
            buttonGroup.className = "btn-group";
        var buttonEdit = document.createElement("button");
            buttonEdit.type = "button";
            buttonEdit.className = "btn btn-outline-info btn-sm";
            buttonEdit.setAttribute("onClick", "editIngredientItem(\"" + tr.id + "\")");
            buttonEdit.innerHTML = '<i class="fas fa-edit"></i> Edit';
        var buttonRemove = document.createElement("button");
            buttonRemove.type = "button";
            buttonRemove.className = "btn btn-outline-danger btn-sm";
            buttonRemove.setAttribute("onClick", "removeIngredientItem(\"" + tr.id + "\")");
            buttonRemove.innerHTML = '<i class="fas fa-trash"></i> Delete';
        var cellHeader = document.createTextNode(dataArray[i][0]);
        var cellContent = document.createTextNode(dataArray[i][1]);
            tr.appendChild(tdName);
            tr.appendChild(tdVal);
            tr.appendChild(tdActions);
                tdActions.appendChild(buttonGroup);
                    buttonGroup.appendChild(buttonEdit);
                    buttonGroup.appendChild(buttonRemove);
            tdName.appendChild(cellHeader);
            tdVal.appendChild(cellContent);
        }
        else
        {
            continue;
        }
        
    }
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
    var cell2 = document.createElement("td");
    var cell3 = document.createElement("td");
    var btnGroupTd = document.createElement('div');
        btnGroupTd.className = 'btn-group';
    var deleteCategoryButton = document.createElement('button');
        deleteCategoryButton.type = 'button';
        deleteCategoryButton.className = 'btn btn-outline-danger btn-sm btn-group';
        deleteCategoryButton.setAttribute("onClick", "deleteCategory(\"" + appendTo.parentNode.id + "\")");
        deleteCategoryButton.innerHTML = '<i class="fas fa-trash"></i> Delete category';
    var deleteIngredientButton = document.createElement('button');
        deleteIngredientButton.type = 'button';
        deleteIngredientButton.className = 'btn btn-outline-danger btn-sm btn-group';
        deleteIngredientButton.innerHTML = '<i class="fas fa-trash"></i> Delete ingredient';
        deleteIngredientButton.setAttribute("onClick", "deleteIngredient(\"" + appendTo.id + "\", \"" + appendTo.parentNode.id + "\")");
    var newPropertyButton = document.createElement("button");
        newPropertyButton.setAttribute("onClick", "addPropertyBox(\"" + appendTo.id + "\", \"" + appendTo.parentNode.id + "\")");
        newPropertyButton.type = "button";
        newPropertyButton.className = "btn btn-outline-success btn-sm btn-group";
        newPropertyButton.innerHTML = '<i class="fas fa-plus"></i> Add new property';
    var btnGroup = document.createElement('div');
        btnGroup.className = 'btn-group';
        table.appendChild(row);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
                cell3.appendChild(btnGroupTd);
                    btnGroupTd.appendChild(newPropertyButton);
                    
    appendTo.appendChild(btnGroup);
        btnGroup.appendChild(deleteIngredientButton);
        btnGroup.appendChild(deleteCategoryButton);
        

}

function deleteCategory (categoryId)
{
    var decision = confirm("Do you really want to delete this category and all of its ingredients?");
        if (decision == true)
        {
            console.log(document.getElementById(categoryId));
            var tempArray = categoryId.split('--');
            var categoryKey = tempArray[1];
            for (i = 0; i < data[0].length; i++)
            {
                if (data[0][i].Name == fixWhiteSpace(categoryKey))
                {
                    data[0][i].Deleted = true;
                }
            }
            for (x = 0; x < data[1].length; x++)
            {
                if (data[1][x].Category == categoryKey)
                {
                    data[1][x].Deleted = true;
                }
            }
            localStorage.setItem('data', JSON.stringify(data));
            location.reload();
            return true;
        }
        else
        {
            return false;
        }
}

function deleteIngredient(ingredientId, categoryId)
{
    var decision = confirm("Do you really want to delete this ingredient?");
        if (decision == true)
        {
            console.log(ingredientId, categoryId);
            var tempArrayIngredient = ingredientId.split('--');
            var ingredientKey = tempArrayIngredient[1];
            var tempArrayCategory = categoryId.split('--');
            var categoryKey = tempArrayCategory[1];
            for (i = 0; i < data[1].length; i++)
            {
                if (data[1][i].Category == categoryKey && data[1][i].Name == fixWhiteSpace(ingredientKey))
                {
                    data[1][i].Deleted = true;
                }
            }
            localStorage.setItem('data', JSON.stringify(data));
            location.reload();
            return true;
        }
        else
        {
            return false;
        }
    
}

function addPropertyBox (containingElement, elementParentId)
{
    var container = document.getElementById(containingElement).parentNode.id;
    var table = document.getElementById(containingElement).lastElementChild;
    var row = document.createElement("tr");
    var cell1 = document.createElement("td");
        cell1.contentEditable = "true";
        cell1.style = "border: 1px solid #090; background: #fafffa;";
    var cell2 = document.createElement("td");
        cell2.contentEditable = "true";
        cell2.style = "border: 1px solid #090; background: #fafffa;";
    var cell3 = document.createElement("td");
    var saveButton = document.createElement("button");
        saveButton.id = "save-button";
        saveButton.type = "button";
        saveButton.className = "btn btn-outline-success btn-sm btn-edit";
        saveButton.setAttribute("onClick", "addProperty(\"" + containingElement + "\", \"" + elementParentId + "\")");
        saveButton.innerHTML = '<i class="fas fa-save"></i> Save';
        
    if (container == elementParentId)
    {
        table.appendChild(row);
            row.appendChild(cell1);
            row.appendChild(cell2);
            row.appendChild(cell3);
                cell3.appendChild(saveButton);
    }

}

function addProperty (ingredientId, categoryId)
{
    var propNameCell = document.getElementById(ingredientId).lastChild.lastChild.cells[0];
    var propValCell = document.getElementById(ingredientId).lastChild.lastChild.cells[1];
    var propName = propNameCell.textContent;
    var propValue = propValCell.textContent;
    if (propNameCell.contentEditable == "true" || propValCell.contentEditable == "true")
    {
        propNameCell.contentEditable = "false";
        propValCell.contentEditable = "false";
        propNameCell.style = "border: 0;";
        propValCell.style = "border: 0;";
    }
    var button = document.getElementById("save-button");
        button.disabled = true;
        button.firstChild.classList.remove("fas");
        button.firstChild.classList.remove("fa-save");
        button.firstChild.className = "fas fa-check";
    
    for (i = 0; i < data[1].length; i++)
    {
        if ('category--' + data[1][i].Category == categoryId && 'ingredient--' + data[1][i].Name == fixWhiteSpace(ingredientId))
        {
            data[1][i][propName] = propValue;
            console.log("New object values: ", data[1][i]);
            localStorage.setItem('data', JSON.stringify(data));
        }
    }
}

function editIngredientItem (editId)
{   
    var editCell = document.getElementById(editId).cells[1];
        editCell.style = "border: 1px solid #090; background: #fafffa;";
    var buttonCell = document.getElementById(editId).cells[2];
    var confirmButton = document.createElement("button");
        confirmButton.id = "edit-button";
        confirmButton.type = "button";
        confirmButton.className = "btn btn-outline-success btn-sm btn-edit";
        confirmButton.setAttribute("onClick", "saveEdit(\"" + editId + "\")");
    var confirmButtonText = document.createElement("i");
        confirmButtonText.className = "fa fa-floppy-o";
        confirmButtonText.setAttribute("aria-hidden", "true");
        buttonCell.appendChild(confirmButton);
            confirmButton.appendChild(confirmButtonText);
    
    editCell.contentEditable = "true";
}

function saveEdit (nodeId)
{
    var editCell = document.getElementById(nodeId).cells[1];
    console.log("Passed Text: ", editCell.textContent);
    var newText = editCell.textContent;
    if (editCell.contentEditable == "true")
    {
        editCell.contentEditable = "false";
        editCell.style = "border: 0;";
    }
    var button = document.getElementById("edit-button");
        button.disabled = true;
        button.firstChild.classList.remove("fa-floppy-o");
        button.firstChild.classList.remove("fa");
        button.firstChild.className = "fa fa-check";
    removeIngredientItem (nodeId, newText, "edit");
}

function removeIngredientItem (deleteId, newText, mode)
{
    var tempArray = deleteId.split("--");
    var categoryKey = tempArray[1];
    var propertyKey = tempArray[0];
    var categoryName = document.getElementById(deleteId).parentNode.parentNode.parentNode.id;
    for (i = 0; i < data[1].length; i++)
    {
        if (('category--' + data[1][i].Category == categoryName && data[1][i].Name == fixWhiteSpace(categoryKey) && data[1][i].hasOwnProperty(propertyKey) == true) && mode != "edit")
        {
            data[1][i][propertyKey] = "deleted";
            document.getElementById(deleteId).remove();
        }
        else if (('category--' + data[1][i].Category == categoryName && data[1][i].Name == fixWhiteSpace(categoryKey) && data[1][i].hasOwnProperty(propertyKey) == true) && mode == "edit")
        {
            data[1][i][propertyKey] = newText;
            console.log("Passed text: ", newText);
        }
    }
    localStorage.setItem('data', JSON.stringify(data));
}

function generateBox (id, text, appendingId, category)
{
    if (id == null || id == '' || document.getElementById(appendingId) == null)
    {
        return false;
    }
    else
    {
        var parent = document.getElementById(appendingId);
        var button = document.createElement('button');
            button.type = 'button';
            button.className = 'collapsible';
        var buttonText = document.createTextNode(text);
        var box = document.createElement('div');
            box.className = 'content';
            box.id = category + '--' + id;
        parent.appendChild(button);
            button.appendChild(buttonText);
        parent.appendChild(box);
    }
}

function createRecipe ()
{
    var recipeName = document.getElementById("recipe-name").value;
    var recipeComment = document.getElementById("recipe-description").value;
    
    if (recipeName == '')
    {
        document.getElementById('recipe-name').placeholder = 'Recipe name missing!';
        document.getElementById('recipe-name').style.outline = "3px solid #fcc";
        return false;
    }

    var recipeItems = [];
    var itemCategories = [];
    var inputCount = document.getElementsByTagName("input");
    for (i = 0; i < inputCount.length; i++)
    {
        if (inputCount[i].checked == true)
        {
            var itemCategoryRaw = inputCount[i].parentNode.parentNode.parentNode.id;
            var tempArray = itemCategoryRaw.split("--");
            var itemCategory = tempArray[1];
            itemCategories.push(itemCategory);
            recipeItems.push(inputCount[i].value);
        }
    }
    console.log("Checkboxes: ", recipeItems);
    var recipeInput = {
        Name: recipeName,
        Description: recipeComment,
        Items: recipeItems,
        Categories: itemCategories,
        Deleted: false
    };
    console.log("Input", recipeInput);
    data[2].push(recipeInput);
    localStorage.setItem('data', JSON.stringify(data));
    location.reload();
}

function fillRecipe(id, recipeInput)
{
    var appendTo = document.getElementById(id);
    var h2 = document.createElement('h2');
    var h2Text = document.createTextNode('Description:');
    var description = document.createElement('p');
        description.className = 'description-text';
        description.id = 'description--' + recipeInput.Name;
    var descriptionText = document.createTextNode(recipeInput.Description);
    var list = document.createElement('ul');
    var header = document.createElement('h2');
    var headerText = document.createTextNode('Ingrediences:');
    var buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group';
        buttonGroup.id = 'actions--' + recipeInput.Name;

    var buttonAdd = document.createElement('button');
        buttonAdd.type = 'button';
        buttonAdd.className = 'btn btn-outline-success btn-sm';
        buttonAdd.setAttribute('onClick', "addRecipeItem(\"" + recipeInput.Name + "\")");
        buttonAdd.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i> Add ingredient';
    
    var buttonDescription = document.createElement('button');
        buttonDescription.type = 'button';
        buttonDescription.className = 'btn btn-outline-info btn-sm';
        buttonDescription.setAttribute('onClick', "editDescription(\"" + recipeInput.Name + "\")");
        buttonDescription.innerHTML = '<i class="far fa-comment" aria-hidden="true"></i> Edit description';
    
    var buttonDelete = document.createElement('button');
        buttonDelete.type = 'button';
        buttonDelete.className = 'btn btn-outline-danger btn-sm';
        buttonDelete.innerHTML = '<i class="fas fa-trash"></i> Delete recipe';
        buttonDelete.setAttribute('onClick', "deleteRecipe(\"" + recipeInput.Name + "\")");

    appendTo.appendChild(header);
    header.appendChild(headerText);
    appendTo.appendChild(list);
    for (i = 0; i < recipeInput.Items.length; i++)
    {
        if (recipeInput.Items[i] == 'deleted')
        {
            continue;
        }
        else
        {
        var buttonRemove = document.createElement('button');
            buttonRemove.type = 'button';
            buttonRemove.className = 'btn btn-outline-danger btn-sm';
            buttonRemove.setAttribute('onClick', "removeRecipeItem(\"" + recipeInput.Name + "\", \""+ recipeInput.Items[i] + "\")");
            buttonRemove.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i> Remove';
        var listNode = document.createElement('li');
            listNode.id = recipeInput.Categories[i] + '--' + recipeInput.Items[i];
        var actionNode = document.createElement('span');
            actionNode.className = 'recipe-action-node';
        var catNode = document.createElement('span');
            catNode.className = 'recipe-cat-name';
        var itemNode = document.createElement('a');
            itemNode.href = '#';
            itemNode.setAttribute("onClick", "showIngredient(\"category--" + recipeInput.Categories[i] + "\", \""+ 'ingredient--' + recipeInput.Items[i] + "\")");
            itemNode.className = 'recipe-item-name icon';
        var catNodeValue = document.createTextNode(fixWhiteSpace(recipeInput.Categories[i]));
        var itemNodeValue = document.createTextNode(fixWhiteSpace(recipeInput.Items[i]));
        list.appendChild(listNode);
            listNode.appendChild(catNode);
                catNode.appendChild(catNodeValue);
            listNode.appendChild(itemNode);
                itemNode.appendChild(itemNodeValue);
            listNode.appendChild(buttonRemove);
        }
    }
    appendTo.appendChild(h2);
        h2.appendChild(h2Text);
    appendTo.appendChild(description);
    description.appendChild(descriptionText);
    appendTo.appendChild(buttonGroup);
    buttonGroup.appendChild(buttonAdd);
    buttonGroup.appendChild(buttonDelete);
    buttonGroup.appendChild(buttonDescription);
}

function deleteRecipe(id)
{
    var decision = confirm("Do you really want to delete this recipe?");
        if (decision == true)
        {
            for (i = 0; i < data[2].length; i++)
            {
                if (data[2][i].Name == id)
                {
                    data[2][i].Deleted = true;
                    localStorage.setItem('data', JSON.stringify(data));
                    window.alert('Recipe deleted.');
                }
            }
            location.reload();
            return true;
        }
        else
        {
            return false;
        }
}

function addRecipeItem(id)
{
    var appendTo = document.getElementById('recipe--' + fixWhiteSpace(id));
    var box = document.createElement('div');
        box.id = 'selectbox--' + id;
        box.className = 'select-box';
    var labelCat = document.createElement('label');
        labelCat.setAttribute('for', 'select-cat--' + id);
    var labelCatText = document.createTextNode('Select category:');
    var selectCat = document.createElement('select');
        selectCat.id = 'select-cat--' + id;
        selectCat.className = 'form-control-sm';
    var buttonLoad = document.createElement('button');
        buttonLoad.type = 'button';
        buttonLoad.className = 'btn btn-outline-success btn-sm';
        buttonLoad.innerHTML = '<i class="fas fa-arrow-up"></i> Load ingredients';
        buttonLoad.setAttribute("onClick", "loadRecipeIngredients(\"" + id + "\")");
    var line = document.createElement('br');
    appendTo.appendChild(box);
        box.appendChild(labelCat);
            labelCat.appendChild(labelCatText);
        box.appendChild(selectCat);
        box.appendChild(buttonLoad);
        box.appendChild(line);

    for (i = 0; i < data[0].length; i++)
    {
        var optionCat = document.createElement('option');
        var optionCatText = document.createTextNode(data[0][i].Name);
        selectCat.appendChild(optionCat);
            optionCat.appendChild(optionCatText);
    }
}

function loadRecipeIngredients(id)
{
    var catValue = document.getElementById('select-cat--' + id).value;
    var box = document.getElementById('selectbox--' + id);
    var labelCat = document.createElement('label');
        labelCat.setAttribute('for', 'select-item--' + id);
    var labelCatText = document.createTextNode('Select ingredient:');
    var selectCat = document.createElement('select');
        selectCat.id = 'select-item--' + id;
        selectCat.className = 'form-control-sm';
    var buttonLoad = document.createElement('button');
        buttonLoad.type = 'button';
        buttonLoad.className = 'btn btn-success btn-sm';
        buttonLoad.innerHTML = '<i class="fas fa-plus"></i> Add ingredient';
        buttonLoad.id = 'save-button--' + id;
        buttonLoad.setAttribute("onClick", "saveRecipeIngredient(\"" + id + "\")");
    box.appendChild(labelCat);
        labelCat.appendChild(labelCatText);
    box.appendChild(selectCat);
    box.appendChild(buttonLoad);
    for (i = 0; i < data[1].length; i++)
    {
        if (data[1][i].Category == catValue)
        {
            var optionItem = document.createElement('option');
            var optionItemText = document.createTextNode(data[1][i].Name);
            selectCat.appendChild(optionItem);
                optionItem.appendChild(optionItemText);
        }
    }
}

function saveRecipeIngredient(id)
{
    var catValue = fixWhiteSpace(document.getElementById('select-cat--' + id).value);
    var itemValue = fixWhiteSpace(document.getElementById('select-item--' + id).value);
    var button = document.getElementById('save-button--' + id);
    for (i = 0; i < data[2].length; i++)
    {
        if (data[2][i].Name == id)
        {
            data[2][i].Categories.push(catValue);
            data[2][i].Items.push(itemValue);
            localStorage.setItem('data', JSON.stringify(data));
            button.innerHTML = '<i class="fas fa-save"></i> Saved!';
            button.disabled = true;
        }
    }
}

function editDescription(id)
{
    var textbox = document.getElementById('description--' + id);
        textbox.contentEditable = 'true';
        textbox.style.outline = '1px solid #08a';
    var buttonGroup = document.getElementById('actions--' + id);
    var buttonSave = document.createElement('button');
        buttonSave.type = 'button';
        buttonSave.id = 'save--' + id;
        buttonSave.className = 'btn btn-danger btn-sm';
        buttonSave.setAttribute('onClick', "saveDescription(\"description--" + id + "\")");
        buttonSave.innerHTML = '<i class="far fa-comment" aria-hidden="true"></i> Save description';
    buttonGroup.appendChild(buttonSave);
}

function saveDescription(id)
{
    var textbox = document.getElementById(id);
    var newText = document.getElementById(id).textContent;
    var tempAr = id.split('--');
    var recipe = tempAr[1];
    for (i = 0; i < data[2].length; i++)
    {
        if (data[2][i].Name == recipe)
        {
            textbox.contentEditable = 'false';
            textbox.style.outline = 'none';
            document.getElementById('save--' + recipe).innerHTML = '<i class="far fa-comment" aria-hidden="true"></i> Saved!';
            document.getElementById('save--' + recipe).disabled = true;
            data[2][i].Description = newText;
            localStorage.setItem('data', JSON.stringify(data));
        }
    }
}

function removeRecipeItem(name, item)
{
    for (i = 0; i < data[2].length; i++)
    {
        if (data[2][i].Name == name)
        {
            for (x = 0; x < data[2][i].Items.length; x++)
            {
                if (data[2][i].Items[x] == item)
                {
                    document.getElementById(fixWhiteSpace(data[2][i].Categories[x]) + '--' + data[2][i].Items[x]).remove();
                    data[2][i].Items[x] = 'deleted';
                    localStorage.setItem('data', JSON.stringify(data));
                    location.reload();
                }
            }
        }
    }
}

function showIngredient(parentId, childId)
{
    var parent = document.getElementById(parentId);
    var child = document.getElementById(childId);
    if (parent.style.display === 'block')
    {
        parent.style.display = 'none';
    }
    else
    {
        parent.style.display = 'block';
    }
    if (child.style.display === 'block')
    {
        child.style.display = 'none';
    }
    else
    {
        child.style.display = 'block';
    }
}

//document.addEventListener('DOMContentLoaded', showItems);


//EXPAND / COLLAPSE SECTIONS

function timeout()
{
    setTimeout(function()
{
    var toggler = document.getElementsByClassName("caret");
    var s;

    for (s = 0; s < toggler.length; s++) {
    toggler[s].addEventListener("click", function() {
        this.parentElement.querySelector(".nested").classList.toggle("li-active");
        this.classList.toggle("caret-down");
    });
}

    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++)
    {
        coll[i].addEventListener("click", function()
        {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block")
            {
                content.style.display = "none";
            }
            else
            {
                content.style.display = "block";
            }
        }
        );
    }
}, 1000);
}
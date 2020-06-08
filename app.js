
// Create a global object for all the different classes in html
var DOMstrings = 
{
    inputType:".add__type",
    inputDescription:".add__description",
    inputValue:".add__value",
    inputButton:".add__btn",

    incomeContainer:".income__list",
    expensesContainer:".expenses__list",

    budgetLabel:".budget__value",
    incomeLabel:".budget__income--value",
    expenseLabel:".budget__expenses--value",

    percentageLabel:".budget__expenses--percentage",

    container:".container",

    expensePercentageLabel: ".item__percentage",

    currentMonth: ".budget__title--month"

};  

////////////////////////////////////////////////////////////////////////////////
// Module 1: Buget Controller
var budgetController = (function()
{
    // Function constructor for all expenses so that we can create an object for all expenses using it
    var Expense = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }    
    
    // To calculate the individual percentages of the income, for each expense 
    Expense.prototype.calculatePercentage = function(totalIncome)
    {
        if(totalIncome>0)
        {
            this.percentage = Math.round((this.value / totalIncome)*(100));
        }
        else
        {
            this.percentage=-1;
        }
        
    };

    // Just to return the percentage calculated
    Expense.prototype.getPercentage = function()
    {
        return this.percentage;
    };


    // Function constructor for all income so that we can create an object for all expenses using it
    var Income = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
    };

    // To calculate final budget
    var calculateTotal = function(type)
    {
        var sum=0;

        // Loop and add the total income or expenses from the above created arrays and assign it to the totals below
        data.allItems[type].forEach(function(cur)
        {
            sum+=cur.value;
        })
        data.totals[type] = sum;
    };


    // To instantiate objects using these, we create another big object 'data' containing all of the values
    var data = 
    {
        allItems:
        {
            exp:[],
            inc:[]
        },
        
        totals:
        {
            exp:0,
            inc:0
        },

        budgets:0,

        percentage:-1

    };

    // Next we create the objects
    return {

        // For adding new items
        addItem: function(type, des , val)
        {
            var newItem;
            var ID; //Unique ID for each item

            // Unique ID
            // We always want ID = lastID+1, even if we delete elements too

            if(data.allItems[type].length > 0)
            {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            else
            {
                ID=0;
            }
        

            // Create and push new items based on inc or exp type 
            if(type==='inc')
            {
                newItem = new Income(ID,des,val);
            }
            else if (type === 'exp')
            {
                newItem = new Expense(ID,des,val);
            }

            // Adding this newly received data into our data object
            data.allItems[type].push(newItem);

            // Return the item added
            return newItem;

        },


        // For deleting existing items
        deleteItem: function(type, id)
        {
            var index, ids;


            // We loop through all the elements' IDs and see which element's ID matches id
            // map here returns an array of all the IDs
            ids = data.allItems[type].map(function(current)
            {
                return current.id;
            });

            // So in index, we have the index of the element to be deleted as per our arrangement
            // The element with ID = id was stored at 'index' or 'ids.indexOf(id)'
            index = ids.indexOf(id);

            // Delete element
            if(index !== -1)
            {   
                // Will start deleting the elements at positon 'index' and delete 1 element
                data.allItems[type].splice(index,1);
            }

        },


        // Actual calculation of the budget
        calculateBudget: function()
        {
            // Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income-expense
            data.budgets = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc>0)
            {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*(100));
            } 
            else
            {
                data.percentage=-1;
            }
            
        },


        // Calculation of new percentages
        calculatePercentages: function()
        {
            // Calculate the individual percentages
            data.allItems.exp.forEach(function(current)
            {
                current.calculatePercentage(data.totals.inc);
            });
            
        },


        // Get the calculated percentages
        getPercentages: function()
        {
            var allPercentages;

            // Calculate the individual percentages
            allPercentages = data.allItems.exp.map(function(current)
            {
                return current.getPercentage();
            });
            return allPercentages;
        },


        // Return the budget calculated
        getBudget: function()
        {
            return{
                budget:data.budgets,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            };

        }

    };

})();

////////////////////////////////////////////////////////////////////////////////
// Module 2 : UI Controller
var UIController = (function()
{

    // Display the numbers in proper format
    // Private function
    var formatNumber = function(num, type)
    {
        var numSplit, int, decimal, sign;

        // 1. + or - before number
        type === 'exp' ? sign = "-": sign = "+"; 

        // 2. Decimal to two places, either round or add .00
        num =  Math.abs(num);
        num = num.toFixed(2);

        // 3. Comma separated thousands
        numSplit = num.split(".");

        int = numSplit[0];
        if(int.length>3)
        {
            // substr(a,b)-> Starts reading at index a and reads b number of elements
            int = int.substr(0,int.length-3) + "," + int.substr(int.length-3, 3);
        }

        decimal = numSplit[1];

        // 4. Return the formatted number
        return sign+" "+int+"."+decimal;

    };

                
    // Creating nodeListForEach function to be called below
    // So basically, we call the function for each element of fields
    // Private function
    var nodeListForEach = function(list,callback)
    {   
        for(var i=0;i<list.length;i++)
        {   
            callback(list[i],i);
        
        }

    };


    // Get the input field data
    return{

        getInput: function()
        {   
            // Return an object with all three input fields
            return {
                type: document.querySelector(DOMstrings.inputType).value, // type will either be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // we need a number, not string
            }

        },

        // This is to update the top part of our page with the data we recieve from user in 'newItem'
        addListItem: function(recObj, type)
        {
            var html, newHtml;
            var selectElement;

            // Create HTML string with placeholder text
            if(type=='inc')
            {
                selectElement = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type=='exp')
            {
                selectElement = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            
            // Replace with actual data
            newHtml = html.replace("%id%",recObj.id);
            newHtml = newHtml.replace("%description%",recObj.description);
            newHtml = newHtml.replace("%value%", formatNumber(recObj.value,type));

            // Insert the HTML into DOM
            document.querySelector(selectElement).insertAdjacentHTML("beforeend",newHtml);

        },

        // This is to update the top part of our page by removing the data, user deletes
        deleteListItem: function(selectorID)
        {   
            var element;

            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },


        // Clear fields after input of values by user
        clearFields: function()
        {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription+', '+DOMstrings.inputValue); // returns a list

            // Trick to convert from list to array
            fieldsArray = Array.prototype.slice.call(fields);

            // Clear all elements in the array
            fieldsArray.forEach(function(current,index,array)
            {
                current.value = ""; 
            });

            // Setting back the focus to the first element after clearing
            fieldsArray[0].focus();
        },


        // Display the calculated budget in the UI
        displayBudget: function(obj)
        {
            var type;

            //Checking the type for formatting
            obj.budget>0 ? type ='inc': type = 'exp'; 
            document.querySelector(DOMstrings.budgetLabel).textContent =formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.expenseLabel).textContent =formatNumber(obj.totalExp,'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            

            // Display percentage properly
            if(obj.percentage>0)
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+"%";
            }
            else
            {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }

        },


        // Display the expense percentages for each expense
        displayPercentages: function(percentages)
        {
            // 'fields' will store a node list returned 
            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);


            // Let's call nodeListForEach, for all the nodeLists, received in the 'fields'
            // So basically, we call the function(current,index) for each element of fields
            nodeListForEach(fields,function(current,index)
            {
                if(percentages[index]>0)
                {
                    current.textContent = percentages[index] + '%';
                }
                else
                {
                    current.textContent = '--';
                }

            });

        },

        // Get the current month
        displayMonth: function()
        {
            var now, year,month,months;

            now = new Date();

            months=["January","February","March","April","May","June","July","August","September","October","November","December"];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.currentMonth).textContent = months[month]+" "+year;
        },



        // Change the border color
        // We make use of the red-focus class from style.css
        changedType: function()
        {
            var fields;

            // Change color
            fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," + 
                DOMstrings.inputValue
            );

            // Change color for all elements
            nodeListForEach(fields,function(current)
            {
                current.classList.toggle('red-focus');
            });

            // Change color for the tick button
            document.querySelector(DOMstrings.inputButton).classList.toggle("red");
        }

    };

})();

////////////////////////////////////////////////////////////////////////////////
// Module 3 : Global App Controller
var controller = (function(budgetCtrl,UICtrl)
{   
    var inputRec, newItem;


    //Setting up event listeners
    var setupEventListeners = function()
    {
        // Tick button is pressed
        document.querySelector(DOMstrings.inputButton).addEventListener("click",function()
        {
            ctrlAddItem();

        });


        //  Any button is pressed
        // 'keypress' is from DOM Event Documentation
        document.addEventListener('keypress',function(event)
        {
            if(event.keyCode === 13 || event.which === 13) // Enter is 13
            {
                ctrlAddItem();
            }
            
        });


        // When the user clicks on cross button - Deletion
        // We add event listener on the parent class for both income and expenses
        document.querySelector(DOMstrings.container).addEventListener('click',ctrlDeleteItem);


        // When we select '-' or '+', the color border should change to red or green accordingly
        document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changedType);

    };



    // Function when enter or tick is clicked
    var ctrlAddItem = function()
    {
        // 1. Get the input data
        inputRec = UICtrl.getInput();

        if(inputRec.description !== "" && !isNaN(inputRec.value) && inputRec.value>0)
        {
            // 2. Add it to the budget controller
            newItem = budgetCtrl.addItem(inputRec.type, inputRec.description, inputRec.value);

            // 3. Add it to the UI in the list
            UICtrl.addListItem(newItem,inputRec.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    };


    // Function when user deletes an entry by hitting the cross icon
    var ctrlDeleteItem = function(event)
    {   
        var itemID,splitID,type,ID;

        // Event bubbling, we want it to trigger the node parent and not the class where the button is pressed
        // To reach the class, "item clearfix", we need to use the prototype property four times
        // This returns the item ID of the item we are trying to delete in the format 'income-1' or 'expense-3'
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;


        //Since other places in the webpage don't have IDs, we make sure nothing happens on clicking somewhere else
        if(itemID)
        {       
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);


            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    };


    var updateBudget = function()
    {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget;
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);

    };


    var updatePercentages = function()
    {

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);

    };



    return{

        // All code that has to be executed at the beginning is placed in init function
        init: function()
        {
            setupEventListeners();       
            
            // Initially all values should be 0
            UICtrl.displayBudget(
            {
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:-1
            })

            // Display current month
            UICtrl.displayMonth();
        }
        
    };
  
})(budgetController,UIController);
controller.init();
////////////////////////////////////////////////////////////////////////////////
const inputBox = document.getElementById("input-Box");
const listContainer = document.getElementById("list-container")

function addTask(){
    const task = inputBox.ariaValueMax.trim()
    if(!task){
        alert("You didn't add anything, don't fool me!");
        return;
    }
}

const li = document.createElement("li");

li.innerHTML = `
    <label>
        <input type = "checkBox">
        <span>${task}</span>
    </label>
    <span class = "edit-btn">Edit</span>
    <span class = "delete-btn">Delelte</span>
    `;

    listContainer.appendChild(li);

class DropdownOptions {
    constructor(master_container, options, update_function=()=>{}) {
        this.container = document.createElement("select");
        master_container.appendChild(this.container);
        for (let option of options){
            this.container.add(new Option(option[0], option[1]));
        }
        this.container.addEventListener("change", update_function);
    }
    getSelection(){
        return this.container.value;
    }
}

class ObjectiveEntry{
    constructor(master_container, variables){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.objective_type = new DropdownOptions(this.container, [["Maximise", "maximise"], ["Minimise", "minimise"]]);
        this.variables = variables;
        this.entries = this.setUpEntries();
    }
    setUpEntries(){
        let label = document.createElement("label");
        label.textContent = "P = ";
        this.container.appendChild(label);
        let entries = {};
        for (let variable of this.variables){
            let current_entry = document.createElement("input");
            this.container.appendChild(current_entry);
            entries[variable] = current_entry;
            if (variable !== this.variables[0]){
                label = document.createElement("label");
                label.textContent = variable+" + ";
                this.container.appendChild(label);
            }else{
                label = document.createElement("label");
                label.textContent = variable;
                this.container.appendChild(label);
            }
        }
        return entries;
    }
    isMaximise(){
        return this.objective_type.getSelection() === "maximise";
    }
    getProfitRow(){

    }
}

class EquationEntry{
    constructor(master_container, variables){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);

    }
}
import {ObjectiveRow} from "./SimplexAlgorithm";

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
            if (variable !== this.variables.at(-1)){
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
    getVarsDictMax(){
        let vars_dict = {};
        for (let variable of this.variables){
            let current_value = Number(this.entries[variable].value);
            if (current_value === undefined) {
                return [false, null];
            } else {
                vars_dict[variable] = current_value * -1;
            }
        }
        return vars_dict;
    }
    getVarsDictMin(){
        let entries_dict = {};
        for (let variable of this.variables){
            let current_value = Number(this.entries[variable].value);
            if (current_value === undefined) {
                return [false, null];
            } else {
                entries_dict[variable] = current_value;
            }
        }
        return entries_dict;
    }
    getProfitRow(){
        let vars_dict = {};
        let name = "P";
        if (this.isMaximise()){
            vars_dict = this.getVarsDictMax();
        } else{
            vars_dict = this.getVarsDictMin();
            name = "Q";
        }
        return new ObjectiveRow(vars_dict, 0, name);
    }
}

class EquationEntry{
    constructor(master_container, variables){
        this.container = document.createElement("div");
        this.variables = variables;
        master_container.appendChild(this.container);
        this.coef_entries = this.createCoefEntries();
        this.inequality_type = new DropdownOptions(this.container, [["≤", "<="], ["≥", ">="]])
        this.value_entry = document.createElement("input");
        this.container.appendChild(this.value_entry);
    }
    createCoefEntries(){
        let entries_dict = {};
        for (let variable of this.variables){
            let current_entry = document.createElement("input");
            this.container.appendChild(current_entry);
            entries_dict[variable] = current_entry;
            if (variable !== this.variables.at(-1)){
                let label = document.createElement("label");
                label.textContent = variable+" + ";
                this.container.appendChild(label);
            } else{
                let label = document.createElement("label");
                label.textContent = variable;
                this.container.appendChild(label);
            }
        }
        return entries_dict;
    }

}
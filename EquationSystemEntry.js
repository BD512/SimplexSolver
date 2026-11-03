import Simplex, {ObjectiveRow, TableThingRow, TheIRow, TwoStageSimplex} from "./SimplexAlgorithm.js";
import {LabelledCheckBox, LabelledTextInput} from "./LabelledEntries.js";
import SimplexNumber from "./SimplexNumber.js";
import {fraction} from "mathjs";

// todo add note about selecting first value as pivot value
// todo add inequality for all variables being bigger than zero
// show inequalities system string after being entered

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
            current_entry.type = "number";
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
            try{
                vars_dict[variable] = new SimplexNumber(fraction(this.entries[variable].value)).multiply(new SimplexNumber(-1));
            }catch(e){
                throw "Invalid coefficient, "+this.entries[variable].value;
            }
        }
        return vars_dict;
    }
    getVarsDictMin(){
        let vars_dict = {};
        for (let variable of this.variables){
            try{
                vars_dict[variable] = new SimplexNumber(fraction(this.entries[variable].value));
            }catch(e){
                throw "Invalid coefficient, "+this.entries[variable].value;
            }
        }
        return vars_dict;
    }
    getProfitRow(){
        let vars_dict = {};
        let name = "P";
        if (this.isMaximise()) {
            vars_dict = this.getVarsDictMax();
        } else {
            vars_dict = this.getVarsDictMin();
            name = "Q";
        }
        return new ObjectiveRow(vars_dict, 0, name);
    }
}

class EquationEntry{
    constructor(master_container, variables, equation_type_change_function=()=>{}){
        this.container = document.createElement("div");
        this.equation_container = document.createElement("div");
        this.extra_vars_container = document.createElement("div");
        this.container.appendChild(this.equation_container);
        this.container.appendChild(this.extra_vars_container);
        this.equation_type_change_function = equation_type_change_function;
        this.variables = variables;
        master_container.appendChild(this.container);
        this.coef_entries = this.createCoefEntries();
        this.inequality_type = new DropdownOptions(this.equation_container, [["≤", "<="], ["≥", ">="]], this.updateInequalityType.bind(this));
        this.value_entry = document.createElement("input");
        this.equation_container.appendChild(this.value_entry);
        this.slack_var_entry = new LabelledTextInput(this.extra_vars_container, "Slack variable name:");
        this.artificial_var_entry = new LabelledTextInput(this.extra_vars_container, "Artificial variable name:");
        this.artificial_var_entry.hide();
    }
    removeContainer(){
        this.container.remove();
    }
    isAnnoying(){
        return this.inequality_type.getSelection() === ">=";
    }
    getSlackVar(){
        return this.slack_var_entry.getEntry();
    }
    getArtificialVar(){
        return this.artificial_var_entry.getEntry();
    }
    getVarsDict(){
        let vars_dict = {};
        for (let variable of this.variables){
            let current_value = this.coef_entries[variable].value;
            if (current_value.length === 0) throw "Fill all cells";
            try{
                vars_dict[variable] = new SimplexNumber(fraction(current_value));
            }catch(e){
                throw "Invalid variable coefficient, "+current_value;
            }
        }
        let slack_var = this.slack_var_entry.getEntry()
        if (slack_var.length === 0) throw "Enter names for all slack variables";
        if (this.isAnnoying()){
            let artificial_var = this.artificial_var_entry.getEntry()
            if (artificial_var.length === 0) throw "Enter names for all relevant artificial variables";
            vars_dict[slack_var] = new SimplexNumber(-1);
            vars_dict[artificial_var] = new SimplexNumber(1);
        } else{
            vars_dict[slack_var] = new SimplexNumber(1);
        }
        return vars_dict;
    }
    getRowValue(){
        let current_value = this.value_entry.value;
        if (current_value.length === 0) throw "Fill all cells";
        try{
            return new SimplexNumber(fraction(current_value));
        }catch(e){
            throw "Invalid value, "+current_value;
        }
    }
    getEquationRow(){
        let row_name;
        if (this.isAnnoying()){
            row_name = this.getArtificialVar();
        } else{
            row_name = this.getRowValue();
        }
        return new TableThingRow(this.getVarsDict(), this.getRowValue(), row_name);
    }
    createCoefEntries(){
        let entries_dict = {};
        for (let variable of this.variables){
            let current_entry = document.createElement("input");
            current_entry.type = "number";
            this.equation_container.appendChild(current_entry);
            entries_dict[variable] = current_entry;
            if (variable !== this.variables.at(-1)){
                let label = document.createElement("label");
                label.textContent = variable+" + ";
                this.equation_container.appendChild(label);
            } else{
                let label = document.createElement("label");
                label.textContent = variable;
                this.equation_container.appendChild(label);
            }
        }
        return entries_dict;
    }
    updateInequalityType(){
        let inequality = this.inequality_type.getSelection();
        if (inequality === "<="){
            this.artificial_var_entry.hide();
            this.equation_type_change_function();
        } else{
            this.artificial_var_entry.show();
            this.equation_type_change_function();
        }
    }

}
class EquationSystemEntry{
    constructor(master_container, variables){
        this.container = document.createElement("div");
        this.equation_container = document.createElement("div");
        this.buttons_container = document.createElement("div");
        this.container.appendChild(this.equation_container);
        this.container.appendChild(this.buttons_container);
        master_container.appendChild(this.container);
        this.variables = variables;
        this.objective_entry = new ObjectiveEntry(this.equation_container, this.variables);
        this.equations = [];
        this.two_stage_checkbox = new LabelledCheckBox(this.container, "Is 2 stage? (as opposed to big-M)?");
        this.two_stage_checkbox.hide();
        this.setUpButtons();
        this.feedback_label = document.createElement("label");
        this.container.appendChild(this.feedback_label);
    }
    addEquation(){
        let equation = new EquationEntry(this.equation_container, this.variables, this.updateInequalityTypes.bind(this));
        this.equations.push(equation);
    }
    updateInequalityTypes(){
        console.log("here!!!!");
        this.two_stage_checkbox.hide();
        for (let equation of this.equations){
            if (equation.isAnnoying()) {
                this.two_stage_checkbox.show();
            }
        }
    }
    removeEquation(){
        if (this.equations.length !== 0){
            let last_equation_entry = this.equations.pop();
            last_equation_entry.removeContainer()
        }
    }
    setUpButtons(){
        let button_container = document.createElement("div");
        let add_button = document.createElement("button");
        add_button.addEventListener("click", () => {this.addEquation()});
        add_button.textContent = "Add";
        let remove_button = document.createElement("button");
        remove_button.addEventListener("click", () => {this.removeEquation()});
        remove_button.textContent = "Remove";
        button_container.appendChild(add_button);
        button_container.appendChild(remove_button);
        this.container.appendChild(button_container);
    }
    createSimplexSystem(){
        if (!this.areExtraVarNamesValid()){
            this.showInvalidVarNamesError();
            return null;
        }
        try{
            let equations = [];
            let objective = this.objective_entry.getProfitRow();
            let artificial_vars = this.getArtificialVars();
            let annoying_rows = [];
            for (let equation of this.equations){
                let current_row = equation.getEquationRow();
                equations.push(current_row);
                if (equation.isAnnoying()){
                    annoying_rows.push(current_row);
                }
            }
            equations.push(objective);
            if (annoying_rows.length > 0){
                if (this.two_stage_checkbox.getEntry()){
                    let i_row = new TheIRow(annoying_rows, artificial_vars);
                    equations.push(i_row);
                    this.clearErrors();
                    return new TwoStageSimplex(equations, objective, i_row, artificial_vars, this.getVarNames());
                }else{
                    objective.updateForBigM(annoying_rows);
                    this.clearErrors();
                    return new Simplex(equations, objective, this.getVarNames());
                }
            }else{
                this.clearErrors();
                return new Simplex(equations, objective, this.getVarNames());
            }
        } catch (e){
            this.showError(e);
        }
    }
    showError(e){
        this.feedback_label.textContent = e;
    }
    clearErrors(){
        this.feedback_label.textContent = "";
    }
    getArtificialVars(){
        let artificial_vars = [];
        for (let equation of this.equations){
            if (equation.isAnnoying()) {
                artificial_vars.push(equation.getArtificialVar());
            }
        }
        return artificial_vars;
    }
    getSlackVars(){
        let slack_vars = [];
        for (let equation of this.equations){
            slack_vars.push(equation.getSlackVar());
        }
        return slack_vars;
    }
    getVarNames(){
        return this.variables + this.getSlackVars() + this.getArtificialVars();
    }
    showInvalidVarNamesError(){
        this.feedback_label.textContent = "Please enter valid, unique values for the slack and artificial variables";
    }
    areExtraVarNamesValid(){
        let var_names = this.getVarNames();
        for (let var_name_index of var_names.length){
            if (var_names.filter(x => x === var_names[var_name_index]).length > 1){
                return false;
            } else if (Number(var_names[var_name_index]) !== undefined){
                return false;
            }
        }
        return true;
    }

}


let b = document.getElementById("set_up_container");
let a = new EquationSystemEntry(b, ["x", "y", "z"]);
// let c = new ObjectiveEntry(b, ["x", "y", "z"]);
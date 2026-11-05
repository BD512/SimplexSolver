import Simplex, {ObjectiveRow, TableThingRow, TheIRow, TwoStageSimplex} from "./SimplexAlgorithm.js";
import {LabelledCheckBox, LabelledTextInput} from "./LabelledEntries.js";
import SimplexNumber from "./SimplexNumber.js";
import {fraction} from "mathjs";
import {DropdownOptions} from "./LabelledEntries.js";

// todo fix fill all cells error which is appearing instead of an invalid number error
// todo - when moving on to 2-stage, do you need to write the table twice

class DecisionVarsEntry{
    constructor(master_container, feedback_function){
        this.container = document.createElement("div");
        this.container.className = "decision-vars-entry";
        master_container.appendChild(this.container);
        this.feedback_function = feedback_function;
        this.entry = new LabelledTextInput(this.container, "Enter decision variable names seperated by commas:");
        this.feedback_label = document.createElement("label");
        this.feedback_label.className = "feedback-label";
        this.enter_button = document.createElement("button");
        this.enter_button.textContent = "Enter";
        this.enter_button.addEventListener("click", ()=>{this.enterVariables()})
        this.container.appendChild(this.enter_button);
        this.container.appendChild(this.feedback_label);
    }
    enterVariables(){
        let [valid, variables] = this.getDecisionVariables();
        if (valid){
            // this.variables = variables;
            this.feedback_function(variables);
        }
    }
    emptyErrorMessage(){
        this.feedback_label.textContent = "Enter more than one value";
    }
    uniqueErrorMessage(){
        this.feedback_label.textContent = "Variables must be unique";
    }
    emptyVarErrorMessage(){
        this.feedback_label.textContent = "Variables must be something other than a space";
    }
    removeEntry(){
        this.container.remove();
    }
    getDecisionVariables(){
        let variables = this.entry.getEntry();
        if (variables.trim().length === 0){
            this.emptyErrorMessage();
            return [false, null];
        } else{
            let vars_list = [];
            for (let variable of variables.split(",")){
                if (variable.trim().length === 0){
                    this.emptyVarErrorMessage();
                    return [false, null];
                }
                if (vars_list.includes(variable.trim())){
                    this.uniqueErrorMessage();
                    return [false, null];
                }
                vars_list.push(variable.trim());
            }
            console.log("vars list", vars_list);
            return [true, vars_list];
        }
    }
}

class VarEntry{
    constructor(master_container, var_name){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.container.className = "var-entry";
        this.entry = document.createElement("input");
        this.entry.type = "number";
        this.container.appendChild(this.entry);
        this.label = document.createElement("label");
        this.label.textContent = var_name;
        this.container.appendChild(this.label);
    }
    getEntry(){
        return this.entry.value;
    }
}

class ObjectiveEntry{
    constructor(master_container, variables){
        this.variables = variables;
        this.container = document.createElement("div");
        this.container.className = "equation-entry";
        master_container.appendChild(this.container);
        this.objective_type = new DropdownOptions(this.container, [["Maximise", "maximise"], ["Minimise", "minimise"]]);
        this.entries = this.setUpEntries();
    }
    setUpEntries(){
        let label = document.createElement("label");
        label.textContent = "P";
        this.container.appendChild(label);
        label = document.createElement("label");
        label.textContent = " = "; // so groups nicely for css
        this.container.appendChild(label);
        let entries = {};
        for (let variable of this.variables){
            // let current_entry =  // document.createElement("input");
            // current_entry.type = "number";
            // this.container.appendChild(current_entry);
            entries[variable] = new VarEntry(this.container, variable);
            if (variable !== this.variables.at(-1)) {
                label = document.createElement("label");
                label.textContent = " + ";
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
                vars_dict[variable] = new SimplexNumber(fraction(this.entries[variable].getEntry())).multiply(new SimplexNumber(-1));
            }catch(e){
                throw "Please enter valid numeric coefficients";
            }
        }
        return vars_dict;
    }
    getVarsDictMin(){
        let vars_dict = {};
        for (let variable of this.variables){
            try{
                vars_dict[variable] = new SimplexNumber(fraction(this.entries[variable].getEntry()));
            }catch(e){
                throw "Please enter valid numeric coefficients";
            }
        }
        return vars_dict;
    }
    getVarsDict(){
        if (this.isMaximise()) {
            return this.getVarsDictMax();
        } else {
            return this.getVarsDictMin();
        }
    }
    getProfitRow(){
        let name = "P";
        let vars_dict = this.getVarsDict()
        if (this.isMaximise()) {
        } else {
            name = "Q";
        }
        return new ObjectiveRow(vars_dict, new SimplexNumber(0), name);
    }
    getEquationString(){
        let s = "";
        if (this.isMaximise()) {
            s += "Maximise P = ";
        }else{
            s += "Minimise P = ";
        }
        let vars_dict = this.getVarsDictMin();
        for (let variable of this.variables){
            if (variable !== this.variables[0]){
                s += " + "
            }
            s += vars_dict[variable].getString() + variable
        }
        return s;
    }
}

class EquationEntry{
    constructor(master_container, variables, equation_type_change_function=()=>{}){
        this.container = document.createElement("div");
        this.container.className = "constraint-entry";
        this.equation_container = document.createElement("div");
        this.equation_container.className = "equation-entry";
        this.extra_vars_container = document.createElement("div");
        this.extra_vars_container.className = "additional-vars-entry";
        this.container.appendChild(this.equation_container);
        this.container.appendChild(this.extra_vars_container);
        this.equation_type_change_function = equation_type_change_function;
        this.variables = variables;
        master_container.appendChild(this.container);
        this.coef_entries = this.createCoefEntries();
        this.inequality_type = new DropdownOptions(this.equation_container, [["≤", "<="], ["≥", ">="]], this.updateInequalityType.bind(this));
        this.value_entry = new VarEntry(this.equation_container, "");// document.createElement("input");
        //this.value_entry.type = "number";
        // this.equation_container.appendChild(this.value_entry);
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
            let current_value = this.coef_entries[variable].getEntry();
            if (current_value.length === 0) throw "Fill all entries with valid values";
            try{
                vars_dict[variable] = new SimplexNumber(fraction(current_value));
            }catch(e){
                throw "Please enter valid numeric coefficients";
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
        let current_value = this.value_entry.getEntry();
        if (current_value.length === 0) throw "Fill all entries with valid values";
        try{
            return new SimplexNumber(fraction(current_value));
        }catch(e){
            throw "Please enter valid numeric values";
        }
    }
    getEquationRow(){
        let row_name;
        if (this.isAnnoying()){
            row_name = this.getArtificialVar();
        } else{
            row_name = this.getSlackVar();
        }
        return new TableThingRow(this.getVarsDict(), this.getRowValue(), row_name);
    }
    createCoefEntries(){
        let entries_dict = {};
        for (let variable of this.variables){
            // let current_entry = document.createElement("input");
            // current_entry.type = "number";
            // this.equation_container.appendChild(current_entry);
            entries_dict[variable] = new VarEntry(this.equation_container, variable); // current_entry;
            if (variable !== this.variables.at(-1)){
                let label = document.createElement("label");
                label.textContent = " + ";
                this.equation_container.appendChild(label);
                // } else{
                // let label = document.createElement("label");
                // label.textContent = variable;
                // this.equation_container.appendChild(label);
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
    getEquationString(){
        let s = "";
        let vars_dict = this.getVarsDict();
        for (let variable of this.variables){
            if (variable !== this.variables[0]){
                s += " + "
            }
            s += vars_dict[variable].getString() + variable
        }
        if (this.isAnnoying()){
            s += " ≥ ";
        } else{
            s += " ≤ ";
        }
        s += this.getRowValue().getString();
        if (this.isAnnoying()){
            s += " ("+this.getSlackVar()+", "+this.getArtificialVar()+")";
        } else{
            s += " ("+this.getSlackVar()+")";
        }
        return s;
    }

}
class EquationSystemEntry{
    constructor(master_container, variables, enter_function){
        this.container = document.createElement("div");
        this.container.className = "one-col-grid";
        this.equation_container = document.createElement("div");
        this.buttons_container = document.createElement("div");
        this.buttons_container.className = "two-col-grid";
        this.container.appendChild(this.equation_container);
        this.container.appendChild(this.buttons_container);
        master_container.appendChild(this.container);
        this.enter_function = enter_function;
        this.variables = variables;
        this.objective_entry = new ObjectiveEntry(this.equation_container, this.variables);
        this.equations = [];
        this.two_stage_checkbox = new LabelledCheckBox(this.container, "Is 2 stage? (as opposed to big-M)?");
        this.two_stage_checkbox.hide();
        this.setUpButtons();
        this.feedback_label = document.createElement("label");
        this.feedback_label.className = "feedback-label";
        this.enter_button = document.createElement("button");
        this.enter_button.textContent = "Enter";
        this.enter_button.addEventListener("click", ()=>{this.enterEquation()})
        this.container.appendChild(this.enter_button);
        this.container.appendChild(this.feedback_label);
    }
    enterEquation(){
        let simplex = this.createSimplexSystem();
        console.log("hello world");
        if (simplex !== null){
            console.log("hi!!");
            this.enter_function(simplex);
        }
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
            this.updateInequalityTypes();
        }
    }
    removeContainer(){
        this.container.remove();
    }
    setUpButtons(){
        // let button_container = document.createElement("div");
        let add_button = document.createElement("button");
        add_button.addEventListener("click", () => {this.addEquation()});
        add_button.textContent = "Add";
        let remove_button = document.createElement("button");
        remove_button.addEventListener("click", () => {this.removeEquation()});
        remove_button.textContent = "Remove";
        this.buttons_container.appendChild(add_button);
        this.buttons_container.appendChild(remove_button);
        this.container.appendChild(this.buttons_container);
    }
    createSimplexSystem(){
        if (!this.areExtraVarNamesValid()){
            this.showInvalidVarNamesError();
            return null;
        } else if (this.equations.length === 0){
            this.showNotEnoughEquationsError();
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
                    let simplex = new Simplex(equations, objective, this.getVarNames());
                    objective.updateForBigM(annoying_rows);
                    this.clearErrors();
                    return simplex;
                }
            }else{
                this.clearErrors();
                return new Simplex(equations, objective, this.getVarNames());
            }
        } catch (e){
            console.log("error.............................................................");
            console.log(e);
            this.showError(e);
            console.log(e);
            return null;
        }
    }
    showNotEnoughEquationsError(){
        this.feedback_label.textContent = "Enter at least 1 equation";
    }
    showError(e){
        console.log("here");
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
        // console.log("vars 3", this.variables);
        // console.log("vars 4", this.variables + [this.getSlackVars()] + [this.getArtificialVars()]);
        let slack_vars = this.getSlackVars();
        let artificial_vars = this.getArtificialVars();
        let variables = this.variables;
        if (slack_vars.length > 0){
            variables = variables.concat(slack_vars);
        }
        if (artificial_vars.length > 0){
            variables = variables.concat(artificial_vars);
        }
        return variables;
    }
    showInvalidVarNamesError(){
        this.feedback_label.textContent = "Please enter valid, unique values for the slack and artificial variables";
    }
    areExtraVarNamesValid(){
        let var_names = this.getVarNames();
        console.log("variables", var_names);
        console.log(new Set(var_names).size);
        console.log(var_names.length)
        if (new Set(var_names).size !== var_names.length) {
            return false;
        }
        // for (let var_name of var_names){
        // if (Number(var_name) !== undefined){
        // return false;
        // }
        // }
        return true;
    }
    getBiggerThanZeroConstraintString(){
        return this.getVarNames().join(",") + "≥ 0";
    }
    getEquationStrings(){
        let equation_strings = [this.objective_entry.getEquationString()];
        for (let equation of this.equations){
            equation_strings.push(equation.getEquationString());
        }
        equation_strings.push(this.getBiggerThanZeroConstraintString());
        if (!this.objective_entry.isMaximise()){
            equation_strings.push("Q = -P");
        }
        return equation_strings;
    }

}

class FullEquationSystemEntry{
    constructor(master_container, entered_setup_info_func){
        this.container = document.createElement("div");
        // this.container.className = "initial-info";
        master_container.appendChild(this.container);
        this.entered_setup_info_func = entered_setup_info_func;
        this.variables = [];
        this.initial_variables_entry = new DecisionVarsEntry(this.container, this.enterInitialVariables.bind(this));
        this.equation_entry = null;
        this.equations_string_container = document.createElement("div");
        this.equations_string_container.className = "one-col-grid";
        this.container.appendChild(this.equations_string_container);
    }
    showEquationEntry(variables){
        this.label = document.createElement("label");
        this.label.textContent = "All variables ≥ 0";
        this.container.appendChild(this.label);
        this.equation_entry = new EquationSystemEntry(this.container, variables, this.enterSimplexSystem.bind(this));
    }
    enterInitialVariables(variables){
        console.log("vars2", variables);
        this.initial_variables_entry.removeEntry();
        this.showEquationEntry(variables);
    }
    showString(){
        let equation_strings = this.equation_entry.getEquationStrings();
        for (let equation of equation_strings){
            let current_label = document.createElement("label");
            current_label.textContent = equation;
            this.equations_string_container.appendChild(current_label);
        }
    }
    enterSimplexSystem(simplex){
        console.log("Here");
        this.showString();
        this.equation_entry.removeContainer();
        this.entered_setup_info_func(simplex);
    }
    hide(){
        this.container.style.display = "none";
    }
    show(){
        this.container.style.display = "block";
    }
}

function test(a){
    console.log("test");
}

// let a = document.getElementById("set_up_container");
// let b = new FullEquationSystemEntry(a, test)
// let a = new EquationSystemEntry(b, ["x", "y", "z"]);
// let c = new ObjectiveEntry(b, ["x", "y", "z"]);
export {FullEquationSystemEntry};
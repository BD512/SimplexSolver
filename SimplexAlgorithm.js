import SimplexNumber from "./SimplexNumber.js";
import rEle from "./UsefulFunctions.js";

export class TableThingRow {
    constructor(variables, row_value, row_var_name){
        this.variables = variables;
        this.row_value = row_value;
        this.row_var_name = row_var_name;
    }
    getValue(){
        return this.row_value
    }
    deleteVar(variable_name){
        console.log("Deleting the variable here.................")
        console.log("Before", this.variables);
        delete this.variables[variable_name];
        console.log("After", this.variables);
    }
    getVarNames() {
        return new Set(Object.keys(this.variables));
    }
    getVarName() {
        return this.row_var_name;
    }
    getThetaValue(pivot_var_name) {
        return this.row_value.divide(this.variables[pivot_var_name]); // todo
    }
    getVarCoef(var_name) {
        return this.variables[var_name];
    }
    addVar(var_name) {
        if (!(Object.hasOwn(this.variables, var_name))){ // todo check this
            this.variables[var_name] = new SimplexNumber(0);
        }
    }
    makeCol1(var_name) {
        let factor = this.variables[var_name];
        this.row_var_name = var_name;
        for (const current_var of Object.keys(this.variables)){
            this.variables[current_var] = this.variables[current_var].divide(factor); // todo check this will always work with big-M method
        }
    }
    makeVal1(var_name) {
        let factor = this.variables[var_name];
        this.row_value = this.row_value.divide(factor);
    }
    makeCol0(var_name, other_row) {
        let factor = new SimplexNumber(-1).multiply(this.variables[var_name].divide(other_row.getVarCoef(var_name)));
        for (const current_var of Object.keys(this.variables)){
            this.variables[current_var] = this.variables[current_var].add(other_row.getVarCoef(current_var).multiply(factor));
        }
    }
    makeVal0(var_name, other_row) {
        // console.log("var_name", var_name);
        // console.log("variables", this.variables);
        // console.log("variable", this.variables[var_name]);
        let factor = new SimplexNumber(-1).multiply(this.variables[var_name].divide(other_row.getVarCoef(var_name)));
        console.log(this.row_value);
        this.row_value = this.row_value.add(other_row.getValue().multiply(factor));
    }
    isObjective() {
        return false;
    }
}
export class ObjectiveRow extends TableThingRow {
    constructor(variables, value, name){
        super(variables, value, name);
    }
    getThetaValue(pivot_var_name) {
        return new SimplexNumber(Infinity);
    }
    checkForLowestVal() {
        let lowest_val = new SimplexNumber(0, 1);
        let lowest_variable = null;
        for (let current_var of Object.keys(this.variables)){
            // console.log(this.variables[current_var]);
            // console.log(this.variables);
            if (this.variables[current_var].isLowerThan(lowest_val)){
                lowest_variable = current_var;
                lowest_val = this.variables[current_var]
            }
        }
        return [lowest_val.getValue() >= 0, lowest_variable];
        // todo find the lowest value by comparing actual values
    }
    isZeroed(){
        return this.row_value.getValue() == 0;
    }
    isObjective() {
        return true;
    }
}
// functions for setting up the IRow
function processExtraRowsCoefs(extra_rows, artificial_vars){
    let vars_dict = {};
    for (let extra_row of extra_rows){
        for (let variable of artificial_vars){
            if (!Object.hasOwn(vars_dict, variable)){
                vars_dict[variable] = new SimplexNumber(-1).multiply(extra_row.getVarCoef(variable)); // todo check this
            } else {
                vars_dict[variable] = vars_dict[variable].add(new SimplexNumber(-1).multiply(extra_row.getVarCoef(variable)));
            }
        }
    }
    return vars_dict;
}
function addExtraRowVals(extra_rows){
    let total = new SimplexNumber(0);
    for (let extra_row of extra_rows){
        total = total.add(extra_row.getValue());
    }
    return total.multiply(new SimplexNumber(-1));
}
export class TheIRow extends ObjectiveRow {
    constructor(extra_rows, artificial_vars, name="I"){
        super(processExtraRowsCoefs(extra_rows, artificial_vars), addExtraRowVals(extra_rows), name);
    }
}

export default class Simplex {
    constructor(table_rows, objective_row, var_names){
        this.table_thing_rows = table_rows;
        this.objective_row = objective_row;
        this.ordered_var_names = var_names;
        this.variable_names = new Set();
        this.updateVars();
    }
    getObjectiveRow() {
        return this.objective_row;
    }
    getRows(){
        return this.table_thing_rows;
    }
    getVarNames() {
        return this.ordered_var_names;
    }
    updateVars() {
        for (let current_row of this.table_thing_rows) {
            for (const variable of current_row.getVarNames()) {
                this.variable_names.add(variable);
            } // todo check no repeats
            // this.variable_names = new Set(this.variable_names.union(current_row.getVarNames()));
        }
        this.createZeroedCols();
    }
    createZeroedCols() {
        for (let var_name of this.variable_names){
            for (let row of this.table_thing_rows){
                // console.log(typeof row);
                // console.log(row);
                // console.log(this.table_thing_rows);
                row.addVar(var_name);
            }
        }
    }
    getNextPivotRow(pivot_var_name){
        let min_theta_value = new SimplexNumber(Infinity);
        let pivot_row = null;
        for (let row of this.table_thing_rows) {
            let current_theta_val = row.getThetaValue(pivot_var_name);
            if (0 < current_theta_val.getValue() && current_theta_val.isLowerThan(min_theta_value)) {
                min_theta_value = current_theta_val;
                pivot_row = row;
            }
        }
        console.log("pivot...........................", pivot_row);
        return pivot_row;
    }
    getPivotColName() {  // todo sort divide by zero for theta values
        let [is_finished, pivot_var_name] = this.objective_row.checkForLowestVal();
        return [is_finished, pivot_var_name];
    }
    getPivot(){
        let [is_finished, pivot_var_name] = this.objective_row.checkForLowestVal();
        let pivot_row = this.getNextPivotRow(pivot_var_name);
        return [is_finished, pivot_row, pivot_var_name];
    }
    performIteration(){
        let [is_finished, pivot_row, pivot_var_name] = this.getPivot();
        console.log("finished", is_finished);
        console.log("pivot row", pivot_row);
        if (is_finished || (pivot_row === null)){
            return true;
        } else {
            for (let row of this.table_thing_rows) {
                if (row !== pivot_row) {
                    row.makeVal0(pivot_var_name, pivot_row);
                    row.makeCol0(pivot_var_name, pivot_row);
                }
            }
            pivot_row.makeVal1(pivot_var_name);
            pivot_row.makeCol1(pivot_var_name);
            return false;
        }
    }
    isStage1(){
        return false;
    }
    getStage2(){
        throw new Error("Not implemented");
    }
    isZeroed() {
        return false;
    }
}

export class TwoStageSimplex extends Simplex {
    constructor(table_rows, future_objective_row, i_row, artificial_vars, var_names) {
        super(table_rows, i_row, var_names);
        this.future_objective_row = future_objective_row;
        this.artificial_vars = artificial_vars;
    }
    getStage2() {
        this.table_thing_rows = rEle(this.table_thing_rows, this.objective_row)
        this.removeVars(this.artificial_vars);
        return new Simplex(this.table_thing_rows, this.future_objective_row, this.ordered_var_names);
    }
    isStage1() {
        return true;
    }
    isZeroed() {
        return this.objective_row.isZeroed();
    }
    removeVars(variables) {
        console.log("attempting to remove variables", variables);
        for (let variable of variables) {
            this.variable_names = new Set([...this.variable_names].filter(v => v !== variable));
            this.ordered_var_names = rEle(this.ordered_var_names, variable);
            for (let row of this.table_thing_rows) {
                row.deleteVar(variable);
            }
        }
    }
}

class SimplexTerminalUI extends Simplex {
    constructor(table_rows, objective_row, row_names) {
        super(table_rows, objective_row, row_names);
    }
    performAllIterations(){
        this.printTable();
        let count = 0;
        while (!(this.performIteration())){
            this.printTable();
            count += 1;
        }
        console.log("Count", count);
    }
    printTable() {
        console.log("Iteration");
        for (let row of this.table_thing_rows) {
            console.log(row.variables);
        }
    }
}

let objective = new ObjectiveRow({"x":new SimplexNumber(-3), "y":new SimplexNumber(-2)}, new SimplexNumber(0), "P");
let table = [new TableThingRow({"x":new SimplexNumber(5), "y":new SimplexNumber(7), "r":new SimplexNumber(1)}, new SimplexNumber(70), "r"),
    new TableThingRow({"x":new SimplexNumber(10), "y":new SimplexNumber(3), "s":new SimplexNumber(1)}, new SimplexNumber(60), "s"),
    objective];
let a = new SimplexTerminalUI(table, objective)
a.performAllIterations()
import splitStringToNumAndMCoef from "./SplitString.js";
import SimplexNumber from "./SimplexNumber.js";
import Simplex, {ObjectiveRow, TableThingRow, TheIRow, TwoStageSimplex} from "./SimplexAlgorithm.js";
import TableThingEntry from "./TableThingEntry.js";
import {LabelledNumberInput, LabelledCheckBox, DropdownOptions} from "./LabelledEntries.js";
// import SimplexSystem from "./index";

class InitialTableInfoEntry {
    constructor(master_container, finished_func){
        // enter number of decision variables
        // enter number of slack variables
        // is 2 stage?
        // if 2 stage, enter number of artificial variables
        // is maximise or minimise
        this.container = document.createElement("div");
        this.container.className = "two-col-grid";
        this.finished_func = finished_func;
        // this.container.className = "FormContainer";
        this.decision_vars_entry = new LabelledNumberInput(this.container, "Number of decision variables:");
        this.slack_vars_entry = new LabelledNumberInput(this.container, "Number of slack variables:");
        this.artificial_vars_entry = new LabelledNumberInput(this.container, "Number of artificial variables:");
        this.is_two_stage_entry = new LabelledCheckBox(this.container, "Using two stage? (opposed to big-M)");
        this.is_two_stage_entry.hide();
        master_container.appendChild(this.container);
        this.updateNumberOfStages = () => {
            // console.log(this.is_two_stage_entry.getEntry());
            if (Number(this.artificial_vars_entry.getEntry()) !== 0 && this.artificial_vars_entry.getEntry().length !== 0) {
                this.is_two_stage_entry.show();
            } else {
                this.is_two_stage_entry.hide();
            }
        }
        this.artificial_vars_entry.setEventFunction(this.updateNumberOfStages);
        this.enter_button = document.createElement("button");
        this.enter_button.textContent = "Enter";
        // this.enter_button.type = "button";
        this.enter_button.addEventListener("click", ()=>{this.enterItems()})
        this.feedback_label = document.createElement("label");
        this.feedback_label.className = "feedback-label"; // todo make feedback labels red
        this.container.appendChild(this.feedback_label);
        this.container.appendChild(this.enter_button);
    }
    enterItems(){
        let no_of_decision_vars = this.decision_vars_entry.getEntry();
        let no_of_artificial_vars = this.artificial_vars_entry.getEntry();
        let no_of_slack_vars = this.slack_vars_entry.getEntry();
        let is_two_stage = this.is_two_stage_entry.getEntry();
        console.log(no_of_decision_vars);
        if (no_of_decision_vars.trim === "" || no_of_artificial_vars === "" || no_of_slack_vars === ""){
            this.feedback_label.textContent = "Please enter valid numeric values."
        } else if (no_of_decision_vars < 1 || no_of_slack_vars < 1 || no_of_artificial_vars < 0) {
            this.feedback_label.textContent = "Number of variables can't be negative and must be at least 1 decision and slack variables.";
        } else if (Number(this.artificial_vars_entry.getEntry()) === 0 || this.artificial_vars_entry.getEntry().length === 0) {
            this.hide();
            this.finished_func(Number(no_of_decision_vars), Number(no_of_slack_vars), Number(no_of_artificial_vars), false);
        } else {
            this.hide();
            this.finished_func(Number(no_of_decision_vars), Number(no_of_slack_vars), Number(no_of_artificial_vars), is_two_stage);
        }
    }
    hide(){
        this.container.style.display = "none";
    }
    show(){
        this.container.style.display = "block";
    }
}

class InitialTableEntry{
    constructor(master_container, decision_vars, slack_vars, artificial_vars, two_stage){
        this.container = document.createElement("table");
        this.container.className = "initial-table";
        // this.container.className = "TableEntry";
        this.two_stage = two_stage;
        this.no_of_decision_vars = decision_vars;
        this.no_of_slack_vars = slack_vars;
        this.no_of_artificial_vars = artificial_vars;
        master_container.appendChild(this.container);
        let [header_entries, entries] = this.createTable(decision_vars, slack_vars, artificial_vars);
        this.header_entries = header_entries;
        this.entries = entries;
        let [profit_row, artificial_row] = this.createProfitRows();
        this.profit_row = profit_row;
        this.artificial_row = artificial_row;
    }
    createHeadersRow(number_of_cols){
        let header_entries = [];
        let current_row = document.createElement("tr");
        let current_col = document.createElement("th");
        current_col.textContent = "Basic";
        current_row.appendChild(current_col);
        for (let col_no=0; col_no<number_of_cols; col_no++){
            let current_col = document.createElement("th");
            let current_entry = document.createElement("input");
            current_entry.type = "text";
            current_entry.className = "TableEntryHeader";
            current_col.appendChild(current_entry);
            header_entries.push(current_entry);
            current_row.appendChild(current_col);
        }
        // current_row = document.createElement("tr");
        current_col = document.createElement("th");
        current_col.textContent = "Value";
        current_row.appendChild(current_col);
        this.container.appendChild(current_row);
        return header_entries;
    }
    createTable(){
        let header_entries = this.createHeadersRow(this.no_of_decision_vars+this.no_of_slack_vars+this.no_of_artificial_vars);
        let entries = [];
        for (let row_number=0; row_number<this.no_of_slack_vars; row_number++){
            let row_entries = this.createEntryRow();
            entries.push(row_entries);
        }
        return [header_entries, entries];
    }
    createProfitRows() {
        let profit_row = this.createEntryRow();
        let the_i_row = null;
        if (this.two_stage) {
            the_i_row = this.createEntryRow();
            return [profit_row, the_i_row];
        }
        return [profit_row, null];
    }
    createEntryRow(){
        let row_entries = [];
        let current_row = document.createElement("tr");
        let current_col = document.createElement("th");
        let current_entry = document.createElement("input");
        current_entry.type = "text";
        current_entry.className = "TableEntry";
        current_col.appendChild(current_entry);
        current_row.appendChild(current_col);
        row_entries.push(current_entry);
        for (let col_number=0; col_number<this.no_of_artificial_vars+this.no_of_slack_vars+this.no_of_decision_vars+1; col_number++){
            let current_col = document.createElement("td");
            let current_entry = document.createElement("input");
            current_entry.type = "text";
            current_entry.className = "TableEntry";
            current_col.appendChild(current_entry);
            current_row.appendChild(current_col);
            row_entries.push(current_entry);
        }
        this.container.appendChild(current_row);
        return row_entries;
    }
    readHeaders(){
        let headers = [];
        for (let header_entry of this.header_entries){
            headers.push(header_entry.value);
        }
        let artificial_var_headers = headers.slice(this.no_of_slack_vars+this.no_of_decision_vars, this.no_of_slack_vars+this.no_of_decision_vars+this.no_of_artificial_vars); // todo check this
        return [headers, artificial_var_headers];
    }
    readRow(current_row, headers, headers_matter=true){
        let row_name = current_row[0].value;
        console.log(headers);
        console.log(row_name);
        if (!(headers.includes(row_name)) && headers_matter){
            return [false, "A row name is not valid"]; // todo think of better error message
        }
        let variables = {};
        for (let current_entry_number=1; current_entry_number<current_row.length-1; current_entry_number++){
            let [is_valid, number, m_coef] = splitStringToNumAndMCoef(current_row[current_entry_number].value);
            if (is_valid){
                variables[headers[current_entry_number-1]] = new SimplexNumber(number, m_coef);
            } else {
                return [false, number];
            }
            // todo make convert string to SimplexNumber instance and add this to dictionary with corresponding var and possibly to artificial var entry if correct position from end of list
        }
        let [is_valid, number, m_coef] = splitStringToNumAndMCoef(current_row[current_row.length-1].value);
        let row_value = 0;
        if (is_valid){
            row_value = new SimplexNumber(number, m_coef);
        } else {
            return [false, number];
        }
        return [true, variables, row_value, row_name];
    }
    getSimplexSystem(){
        // check numbers valid
        // check headers valid
        // check headers in side are also defined along top
        // return a simplex class of the final system
        const [headers, artificial_var_headers] = this.readHeaders();
        let table_rows = [];
        for (let current_row of this.entries){
            let [successful, variables, row_value, row_name] = this.readRow(current_row, headers);
            if (!successful){
                return [false, variables];
            } else{
                console.log("vars in a row", variables);
                let simplex_row = new TableThingRow(variables, row_value, row_name);
                table_rows.push(simplex_row);
            }
        }
        let [successful, variables, row_value, row_name] = this.readRow(this.profit_row, headers, false);
        if (!successful) {
            return [false, variables];
        }
        let profit_row = new ObjectiveRow(variables, row_value, row_name);
        table_rows.push(profit_row);
        if (this.two_stage){
            let [successful, variables, row_value, row_name] = this.readRow(this.artificial_row, headers, false);
            if (!successful){
                return [false, variables];
            }
            let artificial_row = new ObjectiveRow(variables, row_value, row_name);
            table_rows.push(artificial_row);
            let simplex = new TwoStageSimplex(table_rows, profit_row, artificial_row, artificial_var_headers, headers);
            return [true, simplex];
        } else {
            let simplex = new Simplex(table_rows, profit_row, headers);
            return [true, simplex];
        }
    }
    disableEntry(){
        for (let row of this.entries){
            for (let entry of row){
                entry.disabled = true;
            }
        }
    }
}
class TableSetup{
    constructor(master_container, decision_vars, slack_vars, artificial_vars, two_stage, next_func){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.lower_container = document.createElement("div");
        master_container.appendChild(this.lower_container);
        this.lower_container.className = "one-col-grid";
        this.next_func = next_func;
        this.label = document.createElement("label");
        this.label.textContent = "Enter the initial table thing. If 2-stage, this should include the I row. If using big-M, enter any values with M in but don't enter brackets - expand them. If entering fractions, enter them as mixed fractions using /. Enter artificial variables in the last columns before the value column.";
        this.container.appendChild(this.label);
        this.table_entry = new InitialTableEntry(this.container, decision_vars, slack_vars, artificial_vars, two_stage);
        this.feedback_label = document.createElement("label");
        this.feedback_label.className = "feedback-label";
        this.enter_button = document.createElement("button");
        // this.enter_button.type = "button";
        this.buttonPressed = () => {
            console.log("buttonPressed");
            let [successful, simplex] = this.table_entry.getSimplexSystem();
            if (successful){
                this.label.style.display = "none";
                this.enter_button.style.display = "none";
                this.feedback_label.style.display = "none";
                this.table_entry.disableEntry();
                this.next_func(simplex, true);
            } else{
                this.feedback_label.textContent = simplex;
            }
        }
        this.enter_button.addEventListener("click", () => this.buttonPressed());
        this.enter_button.textContent = "Enter";
        this.lower_container.appendChild(this.enter_button);
        this.lower_container.appendChild(this.feedback_label);
    }

}

class FullInitialTableSetup{
    constructor(master_container, feedback_function){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.feedback_function = feedback_function;
        this.initial_setup = new InitialTableInfoEntry(this.container, this.enteredSetupInfo.bind(this));
        this.initial_table_thing_entry = null;
    }
    enteredSetupInfo(decision_vars, slack_vars, artificial_vars, two_stage){
        this.initial_table_thing_entry = new TableSetup(this.container, decision_vars, slack_vars, artificial_vars, two_stage, this.entered.bind(this));
    }
    entered(simplex, show_initial_vals=false){
        this.feedback_function(simplex, show_initial_vals);
    }
    hide(){
        this.container.style.display = "none";
    }
    show(){
        this.container.style.display = "block";
    }
}



export {InitialTableInfoEntry, TableSetup, FullInitialTableSetup};
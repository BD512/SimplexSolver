// todo make thing to show variable values but not theta values for initial table thing
export class TableEntryBox {
    constructor(master_container, id_number, expected_simplex_number, update_function){
        console.log("expected number", expected_simplex_number);
        this.entry = document.createElement("input");
        master_container.appendChild(this.entry);
        this.entry.type = "text";
        this.entry.className = "TableEntry";
        this.update_function = update_function;
        this.id_number = id_number; // in case needed when changing things later
        this.expected_simplex_number = expected_simplex_number;
        this.is_correct = false;
        this.last_user_val = "";
        this.entry.addEventListener("input", (event) => {this.updateEntry()});
    }
    updateEntry(){
        const text = this.entry.value;
        if (this.expected_simplex_number.compareToString(text)){
            this.entry.style.backgroundColor = 'lightgreen';
            this.is_correct = true;
        } else if (text.length === 0){
            this.entry.style.backgroundColor = 'white';
        } else {
            this.entry.style.backgroundColor = 'lightcoral';
            this.is_correct = false;
        }
        this.update_function();
    }
    isCorrect(){
        return this.is_correct;
    }
    disable(){
        this.entry.disabled = true;
    }
    enable(){
        this.entry.disabled = false;
        this.entry.disabled = false;
    }
    showAnswer(){
        console.log("trying to show answer");
        console.log("expected simplex number", this.expected_simplex_number);
        console.log("here");
        this.last_user_val = this.entry.value;
        this.entry.value = this.expected_simplex_number.getString();
        this.disable();
    }
    hideAnswer() {
        this.entry.value = this.last_user_val;
        this.enable();
    }
    permanentlyFillVal(){
        this.entry.value = this.expected_simplex_number.getString();
        this.is_correct = true;
    }
}

export default class TableThingEntry {
    constructor(master_container, id_number, simplex_instance, finished_func, final_table=false){
        this.container = document.createElement("table");
        master_container.appendChild(this.container);
        this.final_table = final_table;
        this.id_number = id_number;
        this.container.id = id_number + "table_thing";
        this.container.className = "table_thing";
        this.simplex_instance = simplex_instance;
        let [finished, pivot_vars] = this.simplex_instance.getPivotColName();
        this.finished = finished;
        // this.showing_answer = false;
        // this.pivot_vars = pivot_vars
        this.finished_func = finished_func;
        this.update = () => {
            if (this.isFinished()) {
                this.disableEntries();
                this.finished_func();
            }
        };
        this.entries = this.setUpTableThing();
        // this.show_ans_button = document.createElement("button");
        // this.show_ans_button.id = "show_ans_button";
        // this.show_ans_button.textContent = "Show answer";
        // this.show_ans_button.addEventListener("click", () => {this.answerButtonPressed()});
        // master_container.appendChild(this.show_ans_button);
    }
    showInitialValues(){
        let first_row = this.entries[0];
        for (let row of this.entries){
            for (let entry of row.slice(0, first_row.length)){
                entry.permanentlyFillVal();
            }
        }
    }
    showAnswer(){
        console.log(this.entries);
        for (let row of this.entries){
            console.log("row", row);
            for (let entry of row){
                entry.showAnswer();
            }
        }
    }
    hideAnswer(){
        console.log(this.entries);
        for (let row of this.entries){
            console.log("row", row);
            for (let entry of row){
                entry.hideAnswer();
            }
        }
    }
    setUpTableHeaders(headers){
        const current_row = document.createElement("tr");
        headers = ["Basic", ...headers, "Value", "Theta value", "Working...?"];
        for (let header of headers){
            const table_header = document.createElement("th");
            table_header.textContent = header;
            current_row.appendChild(table_header);
        }
        this.container.appendChild(current_row);
    }
    setUpTableThing(){
        let headers = this.simplex_instance.getVarNames()
        this.setUpTableHeaders(headers);
        let current_id = 1;
        let cells = [];
        for (let row of this.simplex_instance.getRows()) {
            let show_theta_entry = !row.isObjective() && !this.final_table;
            let [new_cells, new_id] = this.addRow(row, current_id, headers, show_theta_entry);
            current_id = new_id;
            cells.push(new_cells);
        }
        return cells;
    }
    addRow(row, current_id, headers, theta=true){
        let current_row_cells = [];
        let current_row = document.createElement("tr");
        let header = document.createElement("th");
        console.log(typeof row);
        header.textContent = row.getVarName();
        current_row.appendChild(header);
        for (let col of headers) {
            let current_cell = document.createElement("td");
            console.log("is undefined?", row.getVarCoef(col));
            let current_entry = new TableEntryBox(current_cell, this.id_number+current_id, row.getVarCoef(col), this.update);
            current_row_cells.push(current_entry);
            current_id ++;
            current_row.appendChild(current_cell);
        }
        // create entry for the answer
        let current_cell = document.createElement("td");
        console.log("is undefined?", row.getValue());
        let value_entry = new TableEntryBox(current_cell, this.id_number+current_id, row.getValue(), this.update);
        current_row_cells.push(value_entry);
        current_id ++;
        // cells.push(current_row_cells);
        current_row.appendChild(current_cell);
        if (theta){
            let current_cell = document.createElement("td");
            // console.log("is undefined?", row.getThetaValue(this.pivot_var));
            let value_entry = document.createElement("input");// new TableEntryBox(current_cell, this.id_number+current_id, row.getThetaValue(this.pivot_var), this.update);
            value_entry.type = "text";
            value_entry.className = "TableEntry";
            current_cell.appendChild(value_entry);
            // current_id ++;
            // current_row_cells.push(value_entry);
            current_row.appendChild(current_cell);
        } else {
            let current_cell = document.createElement("td");
            current_cell.textContent = "-";
            current_id ++;
            current_row.appendChild(current_cell);
        }
        let cell = document.createElement("td");
        let working_entry = document.createElement("input");
        working_entry.type = "text";
        working_entry.className = "TableEntry";
        cell.appendChild(working_entry);
        current_row.appendChild(cell);
        this.container.appendChild(current_row);
        return [current_row_cells, current_id];
    }
    isFinished(){
        for (let row of this.entries){
            for (let col of row){
                if (!(col.isCorrect())){
                    console.log("here 9999", col);
                    return false;
                }
            }
        }
        return true;
    }
    disableEntries(){
        for (let row of this.entries){
            for (let col of row){
                col.disable();
            }
        }
        return true;
    }
    enableEntries(){
        for (let row of this.entries){
            for (let col of row){
                col.enable();
            }
        }
        return true;
    }
    // update(){
    // if (this.isFinished()){ // todo apparently this is causing an error?
    // this.disableEntries();
    // this.finished_func();
    // }
    // }
}

// export default { TableEntryBox, TableThingEntry };
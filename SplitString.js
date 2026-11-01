import {fraction, add, subtract, multiply, divide} from "mathjs";

function splitStringToNumAndMCoef(s){
    s = s.toUpperCase().replaceAll(" ", "");
    let m_coef = 0;
    let number = 0;
    if (s === "INFINITY" || s === "INF"){
        number = Infinity;
        m_coef = 0;
    } else if (s.length === 0){
        return [false, "Please fill entries"];
    } else if (!(s.includes("M"))){
        try{
            number = fraction(s);
            m_coef = fraction(0);
        } catch(err){
            return [false, "Invalid expression"+s];
        }
    } else if ([...s.matchAll(/M/g)].length !== 1){
        return [false, "too many Ms"];
    } else if (s.includes("+")) {
        console.log("here1");
        let parts = s.split("+");
        if (parts.length > 2){
            return [false, "Invalid expression "+s];
        } else if (parts.length === 1) {
            return [false, "Invalid expression "+s];
        } else {
            console.log(parts[0][0][parts[0].length-1]);
            console.log(parts[1][parts[1].length-1]);
            if (parts[0][parts[0].length-1] === "M"){
                console.log("here2")
                try{
                    number = fraction(parts[1]);
                    if (parts[1].length === 1){
                        m_coef = fraction(1);
                    } else{
                        m_coef = fraction(parts[0].slice(0, parts[0].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }

            } else if (parts[1][parts[1].length-1] === "M") {
                try{
                    console.log("here2");
                    number = fraction(parts[0]);
                    if (parts[1].length === 1){
                        m_coef = fraction(1);
                    } else{
                        m_coef = fraction(parts[1].slice(0, parts[1].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }

            } else {
                return [false, "Invalid expression "+s];
            }
        }
    } else if (s.includes("-")) {
        let parts = s.split("-");
        if ([...s.matchAll(/-/g)].length === 1){
            if (parts[0] === ""){
                try{
                    console.log("here......")
                    number = fraction(0);
                    if (parts[1].length === 1){
                        m_coef = fraction(-1);
                    } else{
                        m_coef = -fraction(parts[1].slice(0, parts[1].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            } else if (parts[0][parts[0].length-1] === "M"){
                try{
                    number = -fraction(parts[1]);
                    if (parts[1].length === 1){
                        m_coef = fraction(1);
                    } else{
                        m_coef = fraction(parts[0].slice(0, parts[0].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            } else if (parts[1][parts[1].length-1] === "M") {
                try{
                    number = fraction(parts[0]);
                    if (parts[1].length === 1){
                        m_coef = fraction(-1);
                    } else{
                        m_coef = -fraction(parts[1].slice(0, parts[1].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            } else {
                return [false, "Invalid expression "+s];
            }
        } else if ([...s.matchAll(/-/g)].length === 2 && s[0] === "-"){
            parts.splice(0, 1);
            console.log(parts);
            if (parts[0][parts[0].length-1] === "M"){
                try{
                    number = -fraction(parts[1]);
                    if (parts[1].length === 1){
                        m_coef = fraction(-1);
                    } else{
                        m_coef = -fraction(parts[0].slice(0, parts[0].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            } else if (parts[1][parts[1].length-1] === "M") {
                try{
                    number = -fraction(parts[0]);
                    if (parts[1].length === 1){
                        m_coef = fraction(-1);
                    } else{
                        m_coef = -fraction(parts[1].slice(0, parts[1].length-1));
                    }
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            } else {
                return [false, "Invalid expression "+s];
            }
        } else {
            return [false, "Invalid expression "+s];
        }
    } else {
        if (s[s.length-1] === "M"){
            if (s.length === 1){
                number = fraction(0);
                m_coef = fraction(1);
            } else{
                try{
                    number = fraction(0);
                    m_coef = fraction(s.slice(0, s.length-1));
                } catch(err){
                    return [false, "Invalid expression"+s];
                }
            }
        } else {
            return [false, "Invalid expression "+s];
        }
    }
    // if (isNaN(number) || isNaN(m_coef)){
    //     return [false, "invalid expression "+s];
    // } else {
    return [true, number, m_coef];
    // }
}
console.log(splitStringToNumAndMCoef("-4M"));
console.log(splitStringToNumAndMCoef("2"));
export default splitStringToNumAndMCoef;
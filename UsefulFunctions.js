const rEle = (a, n) => {
    let new_array = [];
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== n) {
            new_array.push(a[i]);
        }
    }
    return new_array;
};
export default rEle;
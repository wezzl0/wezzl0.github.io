const collegeData = [];
const properties = {
    0: 'early_career_pay',
    1: 'mid_career_pay',
    2: 'make_world_better_percent',
    3: 'stem_percent',
    4: 'early_to_mid_percent_increase',
    5: 'rank_salary_potential_state'
};
let selectedXElement = 0;	// Value of X-axis selection
let selectedYElement = 0;	// Value of Y-axis selection
let displayNum = 0;			// Draw items to graph starting from this to (this + 30)

// Load and copy the data from the csv; this is the inital call to update()
d3.csv("/salary-data.csv", (items) => {
    for (let i = 0; i < items.length; i++) {
        collegeData[i] = items[i];
    }
    update();
});

// When the "X-axis" button is changed, switch value
function selectionChangeX(changedTo) {
    selectedXElement = Number(changedTo);
    displayNum = 0;
    update()
}

// When the "Y-axis" button is changed, switch value
function selectionChangeY(changedTo) {
    selectedYElement = Number(changedTo);
    update()
}

// Move to the next 30 items
function clickInc() {
    if (displayNum + 30 >= collegeData.length) return;
    displayNum += 30;
    update();
}

// Move to the previous 30 items
function clickDec() {
    if (displayNum === 0) return;
    displayNum -= 30;
    update();
}

// Sort collegeData based on the selected y element
function sortObjects() {
    collegeData.sort((item1, item2) => {
        return item1[properties[selectedYElement]] - item2[properties[selectedYElement]]
    });
    // For #5 or 'Salary Pot. Rank' smaller is greater/better, so reverse
    if (selectedYElement !== 5)
        collegeData.reverse();
    update();
}

// Text that will display the full names of x-axis values
// Text is repositioned and updated based on what value is hovered over
const hoverText = d3.select("body")
    .append("div")
    .style("top", "445px")
    .style("position", "absolute")
    .style("visibility", "hidden");

function update() {
    const box = d3.select("body").select("svg");
    box.selectAll("*").remove();

    for (let i = displayNum; i < displayNum + 30 && i < collegeData.length; i++) {

        const item = collegeData[i]
        const itemXPos = (i - displayNum) * 30 + 50;
        const itemValue = item[properties[selectedYElement]];
        const itemHeight = getBarHeight(itemValue);
        const itemYPos = 230 - itemHeight;

        // Draw the elements/bars inside the graph
        box.insert("rect")
            .attr("y", itemYPos + "px")
            .attr("x", itemXPos + "px")
            .attr("fill", "green")
            .style("width", 20 + "px")
            .style("height", itemHeight + "px")
            .on("mouseover", function() {
                // Turn the bar red and display value on top
                d3.select(this).attr("fill", "red");
                d3.select("body").select("svg").append("text")
                    .attr("y", itemYPos - 10 + "px")
                    .attr("x", itemXPos + 10 + "px")
                    .attr("text-anchor", "middle")
                    .attr("fill", "red")
                    .attr("id", "value")
                    .text(itemValue);
            })
            .on("mouseout", function() {
                // Turn bar green and remove value
                d3.select(this).attr("fill", "green");
                box.selectAll("#value").remove();
            });

        // Draw item names along x-axis
        box.insert("text")
            .attr("x", itemXPos + 5 + "px")
            .attr("y", 235 + "px")
            .attr("transform", "rotate(90," + (itemXPos + 5) + ",235)")
            .text(() => {
                if (item.name.length > 15)
                    return item.name.slice(0,15) + "..."
                return item.name;
            }).on("mouseover", function() {
                // Make hoverText visible and update position and value
                return hoverText.style("visibility", "visible").style("left", itemXPos - 20 + "px").text(item.name);
            }).on("mouseout", function() {
                return hoverText.style("visibility", "hidden");
        });
    }
    // Draw X axis
    box.insert("line")
        .attr("x1", 35 + "px")
        .attr("y1", 230 + "px")
        .attr("x2", 35 + "px")
        .attr("y2", 30 + "px")
        .attr("stroke", "black")
    // Draw Y axis values (0 - bottom, 1 = middle, 2 - top)
    const insertText = (n, str) => box.insert("text")
        .attr("x", 32 + "px")
        .attr("y", 230 - 100 * n + "px")
        .attr("text-anchor", "end")
        .text(str);
    switch (selectedYElement) {
        case 0: 	// Early range 30k-100k
            insertText(0, "30k");
            insertText(1, "65k");
            insertText(2, "100k");
            break;
        case 1: 	// Mid range 60k - 160k
            insertText(0, "60k");
            insertText(1, "110k");
            insertText(2, "160k");
            break;
        case 2: 	// MWB% range 0 - 100
            insertText(0, "0");
            insertText(1, "50");
            insertText(2, "100");
            break;
        case 3: 	// Stem% range 0 - 100
            insertText(0, "0");
            insertText(1, "50");
            insertText(2, "100");
            break;
        case 4: 	// %inc range .6 - 1.1
            insertText(0, ".6");
            insertText(1, ".85");
            insertText(2, "1.1");
            break;
        case 5: 	// Rank range 25 - 1
            insertText(0, "25");
            insertText(1, "12");
            insertText(2, "1");
            break;
    }
}

function getBarHeight(value) {
    let scaledValue;
    switch (selectedYElement) {
        case 0: 	// Early range 30k-100k
            scaledValue = (value - 30000) / 70000 * 200;
            break;
        case 1: 	// Mid range 60k - 160k
            scaledValue = (value - 60000) / 100000 * 200;
            break;
        case 2: 	// MWB% range 0 - 100
            scaledValue =  value * 2;
            break;
        case 3: 	// Stem% range 0 - 100
            scaledValue = value * 2;
            break;
        case 4: 	// %inc range .6 - 1.1
            scaledValue = (value - .6) / .5 * 200;
            break;
        case 5: 	// Rank range 25 - 1
            scaledValue = (25 - value) * 8 + 8;
            break;
    }
    return scaledValue;
}
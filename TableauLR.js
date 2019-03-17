class TableauLR{
        /**
         * This function starts with two type A tableaux and produces a type D tableaux
         * filled with empty 2x2 boxes and dominoes.
         * @param  {TableauA} leftA
         * @param  {TableauA} rightA
         * @return {TableauWithGrid}
         */
        static getTableau(leftA, rightA) {
                let answer = new TableauWithGrid({type: "D"});
                let boxRowCount = Math.min(leftA.getColumnLength(0), rightA.getColumnLength(0));
                let boxRowHalfLengths = [];
                for (let y = 0; y < boxRowCount; ++y) {
                        let boxCount = Math.min(leftA.getRowLength(y), rightA.getRowLength(y));
                        boxRowHalfLengths.push(boxCount);
                        for (let x = 0; x < boxCount; ++x) {
                                let domino = new Domino({x: 2 * x, y: 2 * y, box: true, n: ""});
                                answer.insertAtEnd(domino);
                                // leftA.get(x, y).n = "#";
                                // rightA.get(x, y).n = "#";
                        }
                }

                let boxColumnHalfLengths = [];
                let boxColumnCount = answer.getRowLength(0);
                for (let boxColumn = 0; boxColumn < boxColumnCount; boxColumn += 2) {
                        boxColumnHalfLengths.push(answer.getColumnLength(boxColumn) / 2);
                }

                let rightRowCount = rightA.getColumnLength(0)
                for (let yA = 0; yA < rightRowCount; yA++) {
                        let rowLength = rightA.getRowLength(yA);
                        let boxRowLength = boxRowHalfLengths[yA] || 0;
                        if (rowLength == boxRowLength) {
                                continue;
                        }

                        let xA = boxRowLength;
                        let y = 2 * yA;
                        let x = 2 * xA;
                        let domino = new Domino({x: x, y: y, n: "", horizontal: false});
                        answer.insertAtEnd(domino);

                        x += 1;
                        xA += 1;
                        while (xA < rowLength) {
                                if (y == 0 || answer.get(x, y - 1)) {
                                        let domino = new Domino({x: x, y: y, n: "", horizontal: true});
                                        answer.insertAtEnd(domino);
                                        x += 2;
                                } else {
                                        y -= 1;
                                        let domino = new Domino({x: x, y: y, n: "", horizontal: false});
                                        answer.insertAtEnd(domino);
                                        x += 1;
                                }

                                xA++;
                        }
                }

                let leftColumnCount = leftA.getRowLength(0)
                for (let xA = 0; xA < leftColumnCount; xA++) {
                        let columnLength = leftA.getColumnLength(xA);
                        let boxColumnLength = boxColumnHalfLengths[xA] || 0;
                        if (columnLength == boxColumnLength) {
                                continue;
                        }

                        let yA = boxColumnLength;
                        let x = 2 * xA;
                        let y = 2 * yA;
                        let domino = new Domino({x: x, y: y, n: "", horizontal: true});
                        answer.insertAtEnd(domino);

                        y += 1;
                        yA += 1;
                        while (yA < columnLength) {
                                if (x == 0 || answer.get(x - 1, y)) {
                                        let domino = new Domino({x: x, y: y, n: "", horizontal: false});
                                        answer.insertAtEnd(domino);
                                        y += 2;
                                } else {
                                        x -= 1;
                                        let domino = new Domino({x: x, y: y, n: "", horizontal: true});
                                        answer.insertAtEnd(domino);
                                        y += 1;
                                }

                                yA++;
                        }
                }

                return answer;
        }

        /**
         * This function draws a {@link TableauWithGrid} on an HTML page.
         * The drawing of the grid includes shading of the fixed squares.
         * @param  {TableauWithGrid} tableau
         */
        static drawTableau(tableau) {
                document.body.appendChild(new TableauRendererDOM({tableau: tableau}).renderDOM(true));
        }

        /**
         * This function adds a rendered {@link TableauWithGrid} to a div wrapper.
         * The drawing of the grid includes shading of the fixed squares.
         * @param  {TableauWithGrid} tableau
         */
        static addTableauToWrapper(tableau, wrapper){
                wrapper.appendChild(new TableauRendererDOM({tableau: tableau}).renderDOM(true));
        }

        /**
         * This function finds the corners and holes,
         * with respect to the D grid,
         * of a Young diagram described by a partition.
         * @param  {number[]} partition   [description]
         * @param  {boolean} unboxedOnly - if true, only filled corneres
         * and empty holes are returned.
         * @return {Object[]} An array of squares given by their
         * x and y corrdinates and a two-letter descriptor,
         * such as "FC" for a filled corner.
         */
        static getCornersAndHoles(partition, unboxedOnly) {
                let getGridSubPosition = TableauWithGrid.getGrid("D");
                let squareList = [];
                let c0 = partition.length;
                let currentRowLength = partition[0];
                let square;
                let boxedOK = !unboxedOnly;
                // if (this.type == "C" && boxedOK) {
                //         square = new Square({x: 0, y: 0});
                //         square.type = "FH";
                //         squareList.push(square)
                // } else if (this.type == "B" && boxedOK) {
                //         square = new Square({x: 0, y: 0});
                //         square.type = "EC";
                //         squareList.push(square)
                // }

                let x = currentRowLength - 1;
                let gridSubPosition = getGridSubPosition({x: x, y: 0});
                if (gridSubPosition == "Y" && boxedOK) {
                        // empty corner
                        square = new Square({x: x + 1, y: 0});
                        square.type = "EC";
                        squareList.push(square);
                } else if (gridSubPosition == "Z") {
                        // empty hole
                        square = new Square({x: x + 1, y: 0});
                        square.type = "EH";
                        squareList.push(square);
                }

                for (let y = 0; y <= c0; y++) {
                        let nextRowLength = partition[y + 1] || 0;
                        if (nextRowLength < currentRowLength) {
                                // check for filled corner or filled hole
                                let x = currentRowLength - 1;
                                let gridSubPosition = getGridSubPosition({x: x, y: y});
                                if (gridSubPosition == "X") {
                                        // filled corner
                                        square = new Square({x: x, y: y});
                                        square.type = "FC";
                                        squareList.push(square);
                                } else if (gridSubPosition == "W" && boxedOK) {
                                        // filled hole
                                        square = new Square({x: x, y: y});
                                        square.type = "FH";
                                        squareList.push(square);
                                }

                                // check for empty corner or hole
                                let x_next = nextRowLength;
                                let gsp_next = getGridSubPosition({x: x_next, y: y + 1});
                                if (gsp_next == "X" && boxedOK) {
                                        // empty corner
                                        square = new Square({x: x_next, y: y + 1});
                                        square.type = "EC";
                                        squareList.push(square);
                                } else if (gsp_next == "W") {
                                        // empty hole
                                        square = new Square({x: x_next, y: y + 1});
                                        square.type = "EH";
                                        squareList.push(square);
                                }
                        }

                        currentRowLength = nextRowLength;
                }

                return squareList;
        }

        /**
         * This is a helper function for {@link TableauLR#fillTableau}
         * It takes a list of squares as returned by {@link TableauLR#getCornersAndHoles}
         * and returns the index of the first consecutive pair of one empty and one filled.
         * @param  {Object[]} squareList
         * @return {number}
         * @throws Will throw an error if there is no such pair in the list,
         * that is, if either all the squares are filled or all are empty.
         */
        static getInnerPairIndex(squareList) {
                let startType = squareList[0].type[0];
                let index = 1;
                while (true) {
                        let currentType = squareList[index].type[0];
                        if (currentType != startType) {
                                break;
                        }

                        index++;
                        if (index == squareList.length) {
                                throw new Error("There is no inner pair in the list of squares.")
                        }
                }



                return index - 1;
        }

        /**
         * This fills a tableau, described by a partition,
         * with empty 2x2 boxes and empty dominoes.
         * @param  {number[]} partitionInput - a non-increasing array of
         * positive whole numbers
         * @return {TableauWithGrid} uses the D grid
         */
        static fillPartition(partitionInput) {
                let partition = partitionInput.slice();
                let cornersAndHoles = this.getCornersAndHoles(partition);
                let dominoList = [];
                while (cornersAndHoles.length > 0) {
                        let innerPairIndex = this.getInnerPairIndex(cornersAndHoles);
                        let cornerAndHole = cornersAndHoles.splice(innerPairIndex, 2);
                        if (cornerAndHole[0].type[0] == "F") {
                                let x = cornerAndHole[0].x;
                                let y = cornerAndHole[0].y;

                                outerLoop:
                                while (true) {
                                        // let nextXEnd = partition[y + 1] - 1 || -1;
                                        let nextXEnd = (partition[y + 1] || 0) - 1;
                                        while (nextXEnd < x) {
                                                let domino = new Domino({x: x - 1, y: y, horizontal: true, n: ""});
                                                dominoList.push(domino);
                                                x -= 2;
                                                partition[y] -= 2;
                                        }

                                        if (x == nextXEnd) {
                                                break;
                                        }

                                        x++;
                                        y++;
                                        while (true) {
                                                let domino = new Domino({x: x, y: y, horizontal: false, n: ""});
                                                dominoList.push(domino);
                                                partition[y]--;
                                                partition[++y]--;

                                                nextXEnd = (partition[y + 1] || 0) - 1;
                                                if (nextXEnd == x - 1) {
                                                        break outerLoop;
                                                }

                                                if (nextXEnd < x - 1) {
                                                        x--;
                                                        break;
                                                }

                                                y++;
                                        }
                                }

                                while (partition[partition.length - 1] == 0) {
                                        partition.pop();
                                }
                        }

                        /**
                         * Rather than writing new code, this section uses the transpose of the
                         * code above.
                         * Since it calls {@link TableauALR#getTransposePartition} twice,
                         * it's less efficient.
                         * So, it could be rewritten alter if necessary for efficiency.
                         */
                        else {
                                let x = cornerAndHole[1].x;
                                let y = cornerAndHole[1].y;

                                let transposePartition = TableauALR.getTransposePartition(partition);
                                outerLoop2:
                                while (true) {
                                        // let nextYEnd = transposePartition[x + 1] - 1 || -1;
                                        let nextYEnd = (transposePartition[x + 1] || 0) - 1;
                                        while (nextYEnd < y) {
                                                let domino = new Domino({x: x, y: y - 1, horizontal: false, n: ""});
                                                dominoList.push(domino);
                                                y -= 2;
                                                transposePartition[x] -= 2;
                                        }

                                        if (y == nextYEnd) {
                                                break;
                                        }

                                        y++;
                                        x++;
                                        while (true) {
                                                let domino = new Domino({x: x, y: y, horizontal: true, n: ""});
                                                dominoList.push(domino);
                                                transposePartition[x]--;
                                                transposePartition[++x]--;

                                                nextYEnd = (transposePartition[x + 1] || 0) - 1;
                                                if (nextYEnd == y - 1) {
                                                        break outerLoop2;
                                                }

                                                if (nextYEnd < y - 1) {
                                                        y--;
                                                        break;
                                                }

                                                x++;
                                        }
                                }

                                while (transposePartition[transposePartition.length - 1] == 0) {
                                        transposePartition.pop();
                                }

                                partition = TableauALR.getTransposePartition(transposePartition);
                        }
                }

                for (let y = 0; y < partition.length; y += 2) {
                        for (let x = 0; x < partition[y]; x += 2) {
                                let domino = new Domino({x: x, y: y, box: true, n: ""});
                                dominoList.push(domino);
                        }
                }

                dominoList.reverse();
                let tableau = new TableauWithGrid({dominoList, type: "D"});
                return tableau;
        }
}


class TableauALR{
        /**
         * This checks that an input array of numbers,
         * with possibly some NaNs,
         * in fact contains no NaNs,
         * and consists of non-increasing positive numbers.
         * @param  {array} - numberArray
         * @return {boolean}
         */
        static isPartition(numberArray) {
                if (numberArray.length == 0) {
                        return true;
                }

                let currentNumber = numberArray[0];
                if (isNaN(currentNumber) || currentNumber <= 0) {
                        return false;
                }

                for (let index = 1; index < numberArray.length; ++index) {
                        let nextNumber = numberArray[index];
                        if (isNaN(nextNumber) || nextNumber <= 0 || nextNumber > currentNumber) {
                                return false;
                        }

                        currentNumber = nextNumber;
                }

                return true;
        }

        /**
         * This function parses a string representing a partition
         * and then calls {@link TableauALR#makeTableauALR}.
         * @param  {string} partitionString - a string representing a partition
         * @return {TableauA}
         */
        static getTableauALRFromString(partitionString) {
                let partition = partitionString.split(",").filter(x => x).map(x => parseInt(x));
                return this.makeTableauALR(partition);
        }

        /**
         * This function takes a partition and contructs the corresponding Young diagram
         * as a TableauA with blank tiles.
         * @param  {number[]} partition - A non-increasing array of positive whole numbers
         * @return {TableauA}
         * @throws {Error} if the partition input is not valid
         */
        static makeTableauALR(partition) {
                if (!this.isPartition(partition)) {
                        throw new Error("Input is not a valid partition");
                }

                let answer = new TableauA();
                for (let y = 0; y < partition.length; y++) {
                        let rowLength = partition[y];
                        for (let x = 0; x < rowLength; ++x) {
                                answer.insertAtEnd(new Tile({n: "", x: x, y: y}));
                        }
                }

                return answer;
        }

        /**
         * Gets the partition of a tableau, that is,
         * the row lengths from top to bottom.
         * Any object which has getRowLength and getColumnLength methods
         * can use this function.
         * @param  {TableauA | Tableau} tableau
         * @return {number[]}
         */
        static getPartition(tableau) {
                let partition = [];
                let rowCount = tableau.getColumnLength(0);
                for (let y = 0; y < rowCount; ++y) {
                        partition.push(tableau.getRowLength(y));
                }

                return partition;
        }

        /**
         * Gets the column partition of a tableau, that is,
         * the column lengths, from left to right.
         * Any object which has getRowLength and getColumnLength methods
         * can use this function.
         * @param  {TableauA | Tableau} tableau
         * @return {number[]}
         */
        static getColumnPartition(tableau) {
                let partition = [];
                let columnCount = tableau.getRowLength(0);
                for (let x = 0; x < columnCount; ++x) {
                        partition.push(tableau.getColumnLength(x));
                }

                return partition;
        }

        /**
         * Gets the partition of the transpose of the tableau
         * corresponding to this partition.
         * @param  {number[]} partition
         * @return {number[]}
         */
        static getTransposePartition(partition) {
                let tableauA = TableauALR.makeTableauALR(partition);
                return TableauALR.getColumnPartition(tableauA);
        }
}

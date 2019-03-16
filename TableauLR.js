class TableauLR extends TableauCycles {
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
                        let boxRowLength = boxRowHalfLengths[yA]? boxRowHalfLengths[yA]: 0;
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
                        let boxColumnLength = boxColumnHalfLengths[xA]? boxColumnHalfLengths[xA]: 0;
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
}

class TableauALR extends TableauA {
        static getTableauALRFromString(partitionString) {
                let partition = partitionString.split(",").filter(x => x).map(x => parseInt(x));
                return this.makeTableauALR(partition);
        }

        static makeTableauALR(partition) {
                let answer = new TableauA();
                for (let y = 0; y < partition.length; y++) {
                        let rowLength = partition[y];
                        for (let x = 0; x < rowLength; ++x) {
                                answer.insertAtEnd(new Tile({n: "", x: x, y: y}));
                        }
                }

                return answer;
        }
}

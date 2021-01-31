// const { Tile, TableauA, TableauARendererDOM } = require( './TableauA');

/**
 * The Remmel-Whitney algorithm for computing Littlewood-Richardson coefficients 
 * starts with the shape of the first tableau and then successively adds numbered
 * squares to it.  
 * We implement this procedure with a tree structure.  Each added square is a node.
 * It has a pointer back to its parent, which is the node which was previously
 * added to the tableau.  
 * These pointers are then used to assemble the output tableaux, once the procedure
 * has terminated.
 */
class TreeNode {
        /**
         * @param {number} number 
         * @param {number[]} startPartition 
         * @param {number[]} outputPartition 
         * @param {number[]} startPosition 
         * @param {number[]} outputPosition 
         * @param {number[]} currentConstraints 
         * @param {number[]} nextConstraints 
         * @param {TreeNode} parent 
         */
        constructor(number, startPartition, outputPartition, startPosition,
                outputPosition, currentConstraints, nextConstraints, parent) {
                /**
                 * The number which the square will contain.
                 * @type {number}
                 */
                this.number = number;
                /**
                 * The partition where the numbers to be added originally reside.
                 * @type {number[]}
                 */
                this.startPartition = startPartition;
                /**
                 * The shape of the final result, so far.
                 * @type {number[]}
                 */
                this.outputPartition = outputPartition;
                /**
                 * A two-element array with the row and column occupied by the number in the
                 * input tableau.  In this program, the numbers are placed in the original
                 * tableau in lexicographical order (not reverse), however, the rows are 
                 * right-justified.  This array gives the [row, column] indices, with 
                 * both starting at zero.
                 * @type {number[]}
                 */
                this.startPosition = startPosition;
                /**
                 * A two-element array with the row and column occupied by the number in the
                 * output tableau.  This array gives the [row, column] indices, with 
                 * both starting at zero.
                 * @type {number[]}
                 */
                this.outputPosition = outputPosition;
                /**
                 * In the Remmel-Whitney algorithm, numbers are restricted as to which columns they
                 * can occupy.  This array gives the constraints which apply to the current number
                 * and to other numbers in its (input) row. The index in this array applies to 
                 * the number in that column, as specified by the number's startPosition. 
                 * @type {number[]}
                 */
                this.currentConstraints = currentConstraints;
                /**
                 * This array collects the constraints which will apply to the numbers
                 * in the next row of the input tableau.  It will be passed down to them.
                 * @type {number[]}
                 */
                this.nextConstraints = nextConstraints;
                /**
                 * The node's parent is the node holding the number one less than its number in its tableau.
                 * @type {TreeNode}
                 */
                this.parent = parent;
        }

        /**
         * In the Remmel-Whitney algorithm, numbers are added successively to build up tableaux.
         * In general, a number has several positions in which it can be added. 
         * These several places are the children of the given node.
         * These child nodes are created in this function, and then returned in an Array. 
         * In this algorithm, each node, which corresponds to a number in an output tableaux,
         * carries the information necessary to place the next number in its tableaux.  
         * @return {TreeNode[]} An array of 
         */
        makeChildren() {
                const children = [];
                const childNumber = this.number + 1;
                let startRow = this.startPosition[0];
                let startColumn = this.startPosition[1];
                let childStartPosition = [startRow, startColumn + 1];
                let currentConstraints = this.currentConstraints;
                let nextConstraints = this.nextConstraints;
                // The first position in which to (try to) place the child number. 
                let outputRow = this.outputPosition[0];
                let outputColumn  = this.outputPosition[1] + 1;

                // Are we at the end of our row in the starting tableau?
                // If so, we need to move to the next row in the input tableau.
                if (this.number == 0 || startColumn == this.startPartition[0] - 1) {
                        // The first place to add this number is at the bottom of the first column.
                        const childOutputPartition = this.outputPartition.concat([1]);
                        startRow++;
                        // We compute the column of this childNnumber in the right-justified input tableau.
                        startColumn = this.startPartition[0] - this.startPartition[startRow];
                        childStartPosition = [startRow, startColumn];
                        // Since childNumber is in the next row of the input tableau, it, and the other
                        // numbers in its row, will use the next row of constraints.
                        currentConstraints = nextConstraints;
                        nextConstraints = [];
                        const childNextConstraints = [];
                        // This sets the column constraint on the number which sits below childNumber
                        // in the right-justified input tableau.
                        childNextConstraints[startColumn] = 0;
                        outputRow = childOutputPartition.length - 1;
                        outputColumn = 0;
                        const childOutputPosition = [outputRow, outputColumn];
                        const childNode = new TreeNode(childNumber,
                                this.startPartition, childOutputPartition,
                                childStartPosition, childOutputPosition,
                                currentConstraints, childNextConstraints, this);

                        children.push(childNode);

                        outputRow--;
                }

                // This is the rightmost column which the child number can occupy in the output tableaux.
                const endColumn = currentConstraints[childStartPosition[1]];

                // We create child nodes, starting at the row where the current number resides in its output tableaux,
                // and moving up, at each row whose length is less than the length of the row above.
                // We stop when indicated to do so by the column constraint.  
                while(true) {

                        // We can't add a number at the end of this row if the next row up has the same length.
                        if (outputRow > 0 && this.outputPartition[outputRow - 1] == this.outputPartition[outputRow]) {
                                outputRow--;                    
                                continue;
                        }

                        outputColumn = this.outputPartition[outputRow];
                        if (outputColumn > endColumn) {
                                break;
                        }

                        const childOutputPartition = [...this.outputPartition];
                        childOutputPartition[outputRow] += 1;
                        const childOutputPosition = [outputRow, outputColumn];
                        const childNextConstraints = [...nextConstraints];
                        // This sets the column constraint on the number which sits below childNumber
                        // in the right-justified input tableau.
                        childNextConstraints[childStartPosition[1]] = outputColumn;

                        const childNode = new TreeNode(childNumber, this.startPartition, childOutputPartition,
                                childStartPosition, childOutputPosition,
                                currentConstraints, childNextConstraints, this);

                        children.push(childNode);

                        outputRow--;
                        if (outputRow < 0) {
                                break;
                        }
                }

                return children;

        }

        /**
         * This method works its way back up the tree to collect all the nodes in a given 
         * output tableau.  
         * It then returns the information needed to draw the output tableau, namely the first partition
         * passed to the Remmel-Whitney algoritm and the numbers and x and y coordinates of all the 
         * added squares.
         * @return {Object} { tileData: Object, partition: number[] } , tileData: { n: number, x: number, y: number }
         */
        getAncestors() {
                const ancestorNodes = [this];
                let currentNode = this;
                while (true) {
                        const nextNode = currentNode.parent;
                        if (nextNode === null) {
                                break;
                        }

                        ancestorNodes.push(nextNode);
                        currentNode = nextNode;
                }

                // This is the root node.  It doesn't hold a number to be added to the output, but it
                // holds the shape of the the first partition passed to the Remmel-Whitney algoritm.
                const root = ancestorNodes.pop();
                const partition = root.outputPartition;

                const tileData = ancestorNodes.map(node => (
                        {
                                n: node.number,
                                x: node.outputPosition[1],
                                y: node.outputPosition[0]
                        })
                );

                tileData.reverse();

                return { tileData, partition };

        }

        /**
         * This function performs the Remmel-Whitney algorithm.
         * @param {number[]} firstPartition 
         * @param {number[]} secondPartition 
         */
        static doRemmelWhitney (firstPartition, secondPartition) {
                const currentConstraints = Array(secondPartition[0]).fill(2 * firstPartition[0]);
                const firstNode = new TreeNode(0, secondPartition, firstPartition, [-1, -1], [0, 0], currentConstraints, currentConstraints, null);
                const maximumToAdd = secondPartition.reduce((a, b) => a + b, 0);
                const queue = [];
                let nextNode = firstNode;

                while (true) {
                        if (nextNode.number == maximumToAdd) {
                                break;
                        }

                        const children = nextNode.makeChildren();
                        queue.push(...children);

                        nextNode = queue.shift();
                }

                queue.unshift(nextNode);

                const output = queue.map(node => node.getAncestors());

                return output;
        }

        static getRenderedRemmelWhitneyTableaux (firstPartition, secondPartition) {
                const algorithmOutput = this.doRemmelWhitney(firstPartition, secondPartition);
                const tableaux = algorithmOutput.map(result => new TableauARemmelWhitney(result));
                const renderedTableaux = tableaux.map(tableau => new TableauARendererDOM(tableau).renderDOM());
                return renderedTableaux;
        }
}

class TableauARemmelWhitney extends TableauA {
        constructor(table) {
                super([]);
                for(let i = 0; i < table.partition.length; i += 1) {
                        for(let j = 0; j < table.partition[i]; j += 1) {
                                this.insertAtEnd({n: ' ', x: j, y: i});
                        }
                }

                for (const datum of table.tileData) {
                        this.insertAtEnd(new Tile(datum));
                }

        }
}


let x = TreeNode.doRemmelWhitney([3, 2, 1], [3, 2]);
let y = x.map(result => new TableauARemmelWhitney(result));

let w = 1;
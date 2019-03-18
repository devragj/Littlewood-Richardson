/**
 * Some, but not all, of this code is covered by the following license.
 * The original code can be found at https://github.com/devragj/devragj.github.io.
 */

/**
 MIT License

 Copyright (c) 2016-2018 Devra Garfinkle Johnson
 Copyright (c) 2016 Christian Johnson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * @file
 * This file contains the {@link Page} class.
 * The {@link Page} class has methods to handle user input to the page,
 * and to generate the output.
 * @copyright 2016-2019 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * The Page class is responsible for processing the user input to the webpage,
 * and for calling methods to supply the desired output.
 */
class Page {
        /**
         * This is the event handler for the keyup event in the partition textboxes
         * in the page AToD.html.
         * When the Enter key is pressed, this calls the function
         * to compute and draw the domino tableau.
         * @param  {Object} event - DOM event object
         */
        static partitionKeyAToD(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        this.getTableaux();
                }
        }

        /**
         * This function obtains the user input for the page AToD.html.
         * Then it obtains the two TableauA, based on the user input.
         * If the input is not valid, the user is notified with an alert, and the function returns.
         * Otherwise, the function draws the A tableaux.
         * Then it computes the D tableau, and draws it.
         */
        static getTableaux() {
                let leftA;
                let rightA;
                let leftPartitionString = document.getElementById('leftABox').value.trim();
                let rightPartitionString = document.getElementById('rightABox').value.trim();
                try {
                        leftA = TableauALR.getTableauALRFromString(leftPartitionString);
                } catch (e) {
                        alert("Please check your left partition.");
                        return;
                }

                try {
                        rightA = TableauALR.getTableauALRFromString(rightPartitionString);
                } catch (e) {
                        alert("Please check your right partition.");
                        return;
                }

                let tableauAPair = new TableauAPair(leftA, rightA);
                tableauAPair.draw();

                let tableau = TableauLR.getTableau(leftA, rightA);
                this.addTableauToPage(tableau, "tableauLR");
        }

        /**
         * This is the event handler for the keyup event in the partition textbox
         * in the page FillPartition.html.
         * When the Enter key is pressed, this calls the function
         * to fill and draw the domino tableau coming from the entered partition.
         * @param  {Object} event - DOM event object
         */
        static partitionKeyFill(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        this.fillPartition();
                }
        }

        /**
         * This function obtains the user input for the page FillPartition.html.
         * It checks that the input is a valid partition.
         * If the input is not valid, the user is notified with an alert, and the function returns.
         * Otherwise, the function computes the domino tableau associated to the partition,
         * by calling the function {@link TableauLR#fillPartition}.
         * If the partition does not correspond to the shape of a domino tableau,
         * the user is notified with a message on the page.
         * Otherwise, the tableau is drawn on the page.
         */
        static fillPartition() {
                let partitionString = document.getElementById('partitionBox').value.trim();
                this.displayText(partitionString);
                let partition = partitionString.split(",").filter(x => x).map(x => parseInt(x));
                if (!TableauALR.isPartition(partition)) {
                        alert("Please check your partition.");
                        return;
                }

                let tableau;
                try {
                        tableau = TableauLR.fillPartition(partition);
                }

                catch(e) {
                        let output = partitionString + " is not the partition of a domino tableau.";
                        this.displayText(output);
                        return;
                }

                this.addTableauToPage(tableau, "tableauLR");
        }

        /**
         * This is the event handler for the keyup event in the output textareas
         * in the page LRCalculator.html.
         * When the Enter key is pressed, this calls the function
         * to process the output.
         * @param  {Object} event - DOM event object
         */
        static LROutputKey(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        this.showLRTableaux();
                }
        }

        /**
         * This function obtains the user input for the page LRCalculator.html.
         * It then calls the function {@link TableauLR#combineLR} using that input.
         * The resulting tableaux are then drawn on the page.
         * (Previous output is cleared from the page first.)
         */
        static showLRTableaux() {
                this.clearPrevious();
                let leftOutputString = document.getElementById('leftOutputArea').value.trim();
                let rightOutputString = document.getElementById('rightOutputArea').value.trim();
                let tableauxInfo = TableauALR.combineLR(leftOutputString, rightOutputString);
                for (let info of tableauxInfo) {
                        for (let count = 0; count < info.coefficient; count++) {
                                this.addTableauToPage(info.tableau, "floatingTableauLR")
                        }
                }
        }

        /**
         * This function wraps the tableau to draw on the page in a div
         * so that it can be styled, or otherwise manipulated.
         * @param {Tableau} tableau
         */
        static addTableauToPage(tableau, className) {
                let wrapper = document.createElement('div');
                wrapper.className = className;
                TableauLR.addTableauToWrapper(tableau, wrapper);
                document.body.appendChild(wrapper);
        }

        /**
         * This function displays a line of text on the page.
         * It is usually used to display the string representation
         * of the input to the algorithm.
         * @param {string} text - the text to display
         */
        static displayText(text) {
                let wrapper = document.createElement('div');
                wrapper.className = "comment";
                let content = document.createTextNode(text);
                wrapper.appendChild(content);
                document.body.appendChild(wrapper);
        }

        /**
         * This function removes all items on the page which have the given CSS class.
         * @param {string} className - the name of the CSS class to remove.
         */
        static clearItems(className) {
                let itemList = document.getElementsByClassName(className);
                for (let index = itemList.length - 1; index >= 0; --index) {
                        let item = itemList[index];
                        item.parentNode.removeChild(item);
                }
        }

        /**
         * This function removes all output from the page.
         */
        static clearPrevious() {
                let clearList = ["tableauARender", "tableauLR", "comment", "floatingTableauLR"];
                clearList.forEach((type) => Page.clearItems(type));
        }

        /**
         * This function toggles the display of a div.
         * @param {string|Object} info - If a string, the id of the div to toggle.
         * If not, it is the div itself.
         */
        static showHide(info) {
                let divToToggle;
                if (typeof(info) == "string") {
                        divToToggle = document.getElementById(info);
                } else {
                        divToToggle = info;
                }

                if (divToToggle.style.display == 'block') {
                        divToToggle.style.display = 'none';
                } else {
                        divToToggle.style.display = 'block';
                }

        }

        /**
         * This function toggles the display of a div, as well as changing
         * the label of the button whose click triggers the event.
         * @param {Object} button - the button whose click triggers the event.
         */
        static toggleDiv(button) {
                let text = button.innerHTML;
                let divName = "Div";
                if (text[0] == "H") {
                        let newText = text.slice(5);
                        divName = newText + divName;
                        button.innerHTML = newText;
                }

                else {
                        divName = text + divName;
                        button.innerHTML = "Hide " + text;
                }

                let div = document.getElementById(divName);
                this.showHide(div);
        }
}

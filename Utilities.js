class Utilities {
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
         * This function takes a string representation of a partition and parses it into an array.
         * @param {string} partitionString - a string containing, hopefully, a comma-separated list of 
         * positive whole numbers in non-increasing ordet
         * @return {number[]} the numbers of the partition in an array
         */
       static getPartitionFromString(partitionString) {
                let partition = partitionString.split(",").filter(x => x).map(x => parseInt(x));
        
                return this.isPartition(partition)? partition: null;
       }
}
    
// exports.Utilities = Utilities